var channel_access_token = ""
var My_ID = "";
// ボットにメッセージ送信/フォロー/アンフォローした時の処理
function doPost(e) {
    var events = JSON.parse(e.postData.contents).events;
    events.forEach(function(event) {
        if(event.type == "message") {
            reply(event);
        } else if(event.type == "follow") {
            follow(event);
        } else if(event.type == "unfollow") {
            unFollow(event);
        }
    });
}

function reply(event) {
    var replyMessage = "";
    if(event.message.type == "text"){
        replyMessage = assignTheOperation(event);
    }else{
        replyMessage = "コマンドが間違ってるよ！\nわからないときは「使い方」で確認してね！";
    }
    var message = {
        "replyToken" : event.replyToken,
        "messages" : [
        {
            "type" : "text",
            "text" : replyMessage
        }
        ]
    };
    var replyData = {
        "method" : "post",
        "headers" : {
        "Content-Type" : "application/json",
        "Authorization" : "Bearer " + channel_access_token
        },
        "payload" : JSON.stringify(message)
    };
    UrlFetchApp.fetch("https://api.line.me/v2/bot/message/reply", replyData);
}

function assignTheOperation(event){
    var receivedText = event.message.text.split(" ");
    var ronTechDoc = SpreadsheetApp.openById("");
    var ronTechSh = ronTechDoc.getSheetByName('勤務表');
    var brightDoc = SpreadsheetApp.openById("");
    var brightRosterSh = brightDoc.getSheetByName("勤務表");
    
    if(isNaN(receivedText[0])){
        switch(receivedText[0]){
            case "Suica":
                var brightTransportationFeeSh = brightDoc.getSheetByName("交通費（自社負担）");
                brightTransportationFeeSh.getRange("B7").setValue(receivedText[1]);
                return "Suica購入日を更新したよ！";
                break;
            case "月更新":
                ronTechSh.getRange("D1").setValue(receivedText[1]);
                ronTechDoc.rename('現場勤務表 2019年' + receivedText[1] + '月分');
                defaultSetValue(ronTechSh, receivedText[1]);
                return "勤務表を「" + receivedText[1] + "月」に更新したよ！";
                break;
            case "事由":
                var targetRowForReason = findRow(ronTechSh, receivedText[2]);
                ronTechSh.getRange("I" + targetRowForReason).setValue(receivedText[1]);
                return receivedText[2] + "日の事由を「" + receivedText[1] + "」に更新したよ！";
                break;
            case "出勤":
                var target = updateClockInOut(ronTechSh, receivedText);
                ronTechSh.getRange("C" + target[0]).setValue(receivedText[1]);
                return target[1] + "の出勤時刻を更新したよ！" + target[2];
                break;
            case "退勤":
                var target = updateClockInOut(ronTechSh, receivedText);
                ronTechSh.getRange("D" + target[0]).setValue(receivedText[1]);
                return target[1] + "の退勤時刻を更新したよ！" + target[2];
                break;
            case "取り込み":
                CapturingFile(ronTechSh, brightRosterSh, brightDoc);
                return "取り込み完了！中身を確認してね！";
                break;
            case "メール":
                FileTransmission(receivedText[1]);
                var sendMailReport;
                if(receivedText[1] == ""){
                    sendMailReport = "勤務表を添付したメールを下書きに保存したよ！";
                }else if(receivedText[1] == ""){
                    sendMailReport = "勤務表を添付したメールを下書きに保存したよ！";
                }
                return sendMailReport;
                break;
            case "使い方":
                var usage = "※入力時の注意点\nコマンドはすべて単語ごとに半角スペースで区切る\n先頭にスペースが入ってしまってもNG\n\n①出退勤時刻の更新\n「出勤 9:00」で今日の出勤時刻を更新\n「出勤 9:00 12」だと、12日の出勤時刻を更新\n退勤時刻も同様\n②休みの更新\n「12 年休」で12日を年休として更新\n③事由の更新\n「事由 午前休 12」で12日の事由を午前休で更新\n【事由一覧】\n[ 年休、午前休、午後休、早退、遅刻、欠勤、休業日 ]\n④月の更新\n「月更新 4」でシートを4月に更新\n⑤Suica購入日更新\n「Suica 4/8」でSuica定期券購入日を4/8に更新\n⑥現場勤務表データを自社勤務表へ取り込み\n「取り込み」で取り込みを行う\n⑦メール作成、下書き保存\n「メール 現場」で現場勤務表を添付したメールを作成し下書きに保存する\n「メール 自社」で自社勤務表を添付したメールを作成し下書き保存する\n※毎月18日に勤務表、月末に自社勤務表をそれぞれ提出\n該当日が土日の場合は直前の出勤日にアナウンスを行う"
                return usage;
                break;
            default :
                return "コマンドが間違ってるよ！\nわからないときは「使い方」で確認してね！";
                break;
        }
    }else{
        var targetRowForHoliday = findRow(ronTechSh, receivedText[0]);
        ronTechSh.getRange("C" + targetRowForHoliday).setValue("");
        ronTechSh.getRange("D" + targetRowForHoliday).setValue("");
        ronTechSh.getRange("I" + targetRowForHoliday).setValue(receivedText[1]);
        return receivedText[0] + "日を休日に更新したよ！";
    }
}
function defaultSetValue(sheet, month){
    var todat = new Date();
    var endOfMonth = new Date(today.getFullYear(), month, 0);
    var thisMonthOfDays = sheet.getRange(10, 2, endOfMonth.getDate()).getValues();
    var weekDay = thisMonthOfDays.filter(function(day){
        if(day.getValue() != ("土" || "日" || "祝" || "休")){
            return day.getNumRows();
        }        
    });
    for(var i=0; i<=weekDay.length; i++){
        sheet.getRange(weekDay, 3).setValue("9:00");
        sheet.getRange(weekDay, 4).setValue("18:00");
    }
}
function findRow(sheet, date){
    var targetDate = sheet.getRange(10, 1, 31).getValues();    
    for(var i=0; i<=targetDate.length; i++){
        if(targetDate[i][0].getDate() == date){
            return i + 10;
        }
    }
    return 0;
}
function updateClockInOut(ronTechSh, receivedText){
    var targetRowForclock;
    var date;
    if(receivedText.length == 2){
        var today = new Date();
        var tmpsendRontech = new Date(today.getFullYear(), today.getMonth(), 18);
        var tmpsendBright = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        var sendRontech = sendMailJudge(tmpsendRontech);
        var sendBright = sendMailJudge(tmpsendBright);
        var message;
        if(today.getDate() == sendRontech){
            message = "今日は勤務表提出日だよ！確認してメールを送ってね！";
        }else if(today.getDate() == sendBright){
            message = "今日は勤務表提出日だよ！確認してメールを送ってね！";
        }else{
            message = "";
        }
        date = "今日";
        targetRowForclock = findRow(ronTechSh, today.getDate());
        return [targetRowForclock, date, message];
    }else if(receivedText.length == 3){
        date = receivedText[2] + "日";
        targetRowForclock = findRow(ronTechSh, receivedText[2]);
        return [targetRowForclock, date];
    }
}
function sendMailJudge(tmpDay){
    if(tmpDay.getDay() == 0){
        return tmpDay.getDate() - 3;
    }else if(tmpDay.getDay() == 6){
        return tmpDay.getDate() - 2;
    }else{
        return tmpDay.getDate();
    }
}
function CapturingFile(ronTechSh, brightRosterSh, brightDoc) {  
    var date = ronTechSh.getRange(10, 1, 31, 4).getValues();
    var year = ronTechSh.getRange('A1').getValue();
    var month = ronTechSh.getRange('D1').getValue();
    brightRosterSh.getRange('U3').setValue(year);
    brightRosterSh.getRange('W3').setValue(month);
    brightDoc.rename('勤務表・交通費 ' + year + '年' + month + '月分');
    
    for(var i=0; i <= 31; i++){
        var lunchStartTime;
        var lunchEndTime;
        var breakTime;
        var startTime;
        var endTime;
        try{
            var tmpStartTime = new Date(date[i][2]);
            var tmpEndTime = new Date(date[i][3]);
        }catch(e){}

        if(tmpStartTime != 'Invalid Date'){
            startTime = new Date(tmpStartTime.getYear(), tmpStartTime.getMonth(), tmpStartTime.getDate(), tmpStartTime.getHours() + 7, tmpStartTime.getMinutes());
            endTime = new Date(tmpEndTime.getYear(), tmpEndTime.getMonth(), tmpEndTime.getDate(), tmpEndTime.getHours() + 7, tmpEndTime.getMinutes());
            startTime = Utilities.formatDate(startTime, "JST", "HH:mm");
            endTime = Utilities.formatDate(endTime, "JST", "HH:mm");
            lunchStartTime = '12:00';
            lunchEndTime = '13:00';
            breakTime = '1:00';        
        }else{        
            startTime = '';
            endTime = '';
            lunchStartTime = '';
            lunchEndTime = '';
            breakTime = '';
        }
        brightRosterSh.getRange(i+8, 3).setValue(startTime);
        brightRosterSh.getRange(i+8, 4).setValue(endTime);
        brightRosterSh.getRange(i+8, 5).setValue(lunchStartTime);
        brightRosterSh.getRange(i+8, 6).setValue(lunchEndTime);
        brightRosterSh.getRange(i+8, 10).setValue(startTime);
        brightRosterSh.getRange(i+8, 11).setValue(endTime);
        brightRosterSh.getRange(i+8, 12).setValue(breakTime);
    }  
}

function FileTransmission(destination){
    var text;
    if(destination == ""){
        var attachmentFile = DriveApp.getFileById("");
        var xlsxName = attachmentFile.getName() + ".xlsx";
        //エクスポート用のURL
        var fetchUrl = "https://docs.google.com/feeds/download/spreadsheets/Export?key=&amp;exportFormat=xlsx";
        text = '各位\n\nお疲れ様です。\n今月分の現場勤務表を送付致します。\nご確認よろしくお願いいたします。';
    }else if(destination == ""){
        var attachmentFile = DriveApp.getFileById("");
        var xlsxName = attachmentFile.getName() + ".xlsx";
        //エクスポート用のURL
        var fetchUrl = "https://docs.google.com/feeds/download/spreadsheets/Export?key=&amp;exportFormat=xlsx";
        text = '各位\n\nお疲れ様です。\n今月分の自社勤務表を送付致します。\nご確認よろしくお願いいたします。';
    }  
    //OAuth2対応
    var fetchOpt = {
        "headers" : { Authorization: "Bearer " + ScriptApp.getOAuthToken() },
        "muteHttpExceptions" : true
    };
    //URLをダウンロード
    var xlsxFile = UrlFetchApp.fetch(fetchUrl, fetchOpt).getBlob().setName(xlsxName)
    var d = new Date();
    var thisYear = d.getFullYear();
    var thisMonth = d.getMonth() + 1;
    
    var to = '';
    var cc = '';
    var title = '勤務表 ' + thisYear + '年' + thisMonth + '月分';
    var signature = '';
    var otherInfo = {
        attachments: xlsxFile,
        cc: cc,
        from: '',
        name: ''
    }
    var body = text + signature;
    GmailApp.createDraft(to, title, body, otherInfo);
}


function pushMessage() {
    //deleteTrigger();
  var postData = {
    "to": My_ID,
    "messages": [{
      "type": "text",
      "text": "おはよう",
    }]
  };

  var url = "https://api.line.me/v2/bot/message/push";
  var headers = {
    "Content-Type": "application/json",
    'Authorization': 'Bearer ' + channel_access_token,
  };

  var options = {
    "method": "post",
    "headers": headers,
    "payload": JSON.stringify(postData)
  };
  var response = UrlFetchApp.fetch(url, options);
}
/* フォローされた時の処理 */
function follow(e) {

}

/* アンフォローされた時の処理 */
function unFollow(e){

}
