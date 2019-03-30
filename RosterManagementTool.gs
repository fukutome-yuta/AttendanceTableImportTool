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

// 入力されたメッセージをおうむ返し
function reply(event) {
    var replyMessage = "";
    if(event.message.type == "text"){
        replyMessage = assignTheOperation(event);
    }else{
        replyMessage = "Text以外は返せません・・・";
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
                return "ロンテック勤務表を「" + receivedText[1] + "月」に更新したよ！";
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
                return target[1] + "の退勤時刻を更新したよ！";
                break;
            case "取り込み":
                CapturingFile(ronTechSh, brightRosterSh, brightDoc);
                return "取り込み完了！中身を確認してね！";
                break;
            case "メール":
                FileTransmission(receivedText[1]);
                var sendMailReport;
                if(receivedText[1] == "ロンテック"){
                    sendMailReport = "ロンテック勤務表を添付したメールを下書きに保存したよ！";
                }else if(receivedText[1] == "ブライト"){
                    sendMailReport = "ブライト勤務表を添付したメールを下書きに保存したよ！";
                }
                return sendMailReport;
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
            message = "今日はロンテック勤務表提出日だよ！確認してメールを送ってね！";
        }else if(today.getDate() == sendBright){
            message = "今日は自社勤務表提出日だよ！確認してメールを送ってね！";
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
        return tmpDay.getDate() - 2;
    }else if(tmpDay.getDay() == 6){
        return tmpDay.getDate() - 1;
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
    if(destination == "ロンテック"){
        var attachmentFile = DriveApp.getFileById("");
        var xlsxName = attachmentFile.getName() + ".xlsx";
        //エクスポート用のURL
        var fetchUrl = "https://docs.google.com/feeds/download/spreadsheets/Export?key=&amp;exportFormat=xlsx";
    }else if(destination == "ブライト"){
        var attachmentFile = DriveApp.getFileById("");
        var xlsxName = attachmentFile.getName() + ".xlsx";
        //エクスポート用のURL
        var fetchUrl = "https://docs.google.com/feeds/download/spreadsheets/Export?key=&amp;exportFormat=xlsx";
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
    var text = '各位\n\nお疲れ様です。\n今月分の勤務表を送付致します。\nご確認よろしくお願いいたします。';
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
