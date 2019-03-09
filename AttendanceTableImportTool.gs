function CapturingFile() {
  
  var importFile = DriveApp.getFolderById('[key]').getFiles();
  var importFileId;
  
  while(importFile.hasNext()){
    var tmpFile = importFile.next();
    importFileId = tmpFile.getId();
  }
  
  var ronTechSh = SpreadsheetApp.openById(importFileId).getSheetByName('勤務表');
  var brightDoc = SpreadsheetApp.openById('[key]');
  var brightSh = brightDoc.getSheetByName('勤務表');
  
  var date = ronTechSh.getRange(10, 1, 31, 4).getValues();
  var year = ronTechSh.getRange('A1').getValue();
  var month = ronTechSh.getRange('D1').getValue();
  brightSh.getRange('U3').setValue(year);
  brightSh.getRange('W3').setValue(month);
  
  brightDoc.rename('勤務表・交通費 ' + year + '年' + month + '月分');
  
  for(var i=0; i <= 31; i++){
    
    var lunchStartTime;
    var lunchEndTime;
    var breakTime;
    
    try{
      var tmpStartTime = new Date(date[i][2]);
      var tmpEndTime = new Date(date[i][3]);
    }catch(e){}
    
    var startTime;
    var endTime;
    
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
    
    brightSh.getRange(i+8, 3).setValue(startTime);
    brightSh.getRange(i+8, 4).setValue(endTime);
    brightSh.getRange(i+8, 5).setValue(lunchStartTime);
    brightSh.getRange(i+8, 6).setValue(lunchEndTime);
    brightSh.getRange(i+8, 10).setValue(startTime);
    brightSh.getRange(i+8, 11).setValue(endTime);
    brightSh.getRange(i+8, 12).setValue(breakTime);
   
  }
  
  Browser.msgBox('取り込み完了！\\n中身を確認してね！');
  
}

function FileTransmission(){
 
  var attachmentFile = DriveApp.getFileById('[key]');
  
  var xlsxName = attachmentFile.getName() + ".xlsx";
    //エクスポート用のURL
  var fetchUrl = "https://docs.google.com/feeds/download/spreadsheets/Export?key=1smr1DxwBi5R9EyBg2lQEzWB6Y68WYCkG2rU66G99mxs&amp;exportFormat=xlsx";

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
  var text = '';
  var otherInfo = {
    attachments: xlsxFile,
    cc: cc,
    from: '',
    name: ''
  }
    
  var Judgment = Browser.msgBox('内容を確認してね！','宛先：' + to  + '\\n cc：' + cc + '\\n  件名：' + title + '\\n  本文： \\n\\n' + text + '\\n\\nこの内容で送信してもいいかい？\\n（下書きに保存するときは「いいえ」を押してね！）', Browser.Buttons.YES_NO_CANCEL);
  
  var body = text + signature;
  
  if(Judgment == 'yes'){
    
    GmailApp.sendEmail(to, title, body, otherInfo);
    Browser.msgBox('送信完了！');
    
  }else if(Judgment == 'no'){
    
    GmailApp.createDraft(to, title, body, otherInfo);
    Browser.msgBox('下書きに保存しました！');
    
  }else{
    
    Browser.msgBox('送信をキャンセルしました！');
    
  }
}

