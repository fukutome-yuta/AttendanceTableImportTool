//JavaScript Sample Program
//ウィンドウ✕閉じボタン押下時のイベント取得
var result = false; //window.onbeforeunloadの条件分岐用
window.onload = function(){

    //✕ボタン以外に画面遷移のボタンがあれば処理を分ける
    var btn1  = document.getElementById("button1");
    btn1.onclick  = function(){
        result = true;
    }
}
//画面遷移処理は問答無用でイベントが発火するので条件分岐を加えて✕ボタンのみを検知する
window.onbeforeunload = function(){
    if(result){
        //処理
    }else{
        //処理
    }    
}

//URLパラメータを配列にする処理
window.onload = function(){
	var params = {};
	var urlParameters = [];
	urlParameters = location.search.substring(1).split("&");

	for(var i=0; urlParameters[i]; i++) {
		var piecesParam = [];
		piecesParam = urlParameters[i].split("=");
		params[piecesParam[0]] = piecesParam[1];
	}

	for(var key in params){
		if(key == "param1"){
			if(params[key] == ""){
				//処理
			}
		}
	}
}


//JavaScriptからサーバ側の処理を呼び出す
<!-- JSON形式の文字列を処理する為のファイル -->
<script src="json2.js"></script>
function getValue(){

    //XMLHttpRequestでサーバ側の処理をgetメソッドで呼び出す
    var type="get"

    //サーバ側で処理をするファイルパス クエリストリングで値を渡す
    var url="sampleURL?No=001";
    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function () {
        //XMLHttpRequest クライアントの操作が完了の場合 = 4
        if (xmlhttp.readyState == 4) {
            //レスポンスのHTTPステータスが正常の場合 = 200
            if (xmlhttp.status == 200) {
                
                //JSON形式で取得したデータをパースして各フィールドへ反映
                var returnData = JSON.parse(xmlhttp.responseText);

                //ページ内のすべてのlabelを配列で取得する
                var labels = document.getElementsByTagName("label");
                var arrayOfLabelName = [];
                for(var i=0; i < labels.length; i++){
                    arrayOfLabelName.push(labels[i].id);
                }
                
                //ページ内のすべてのinputを配列で取得する
                var input = document.getElementsByTagName("input");
                var arrayOfCheckBoxName = [];
                for(var i=0; i < input.length; i++){
                    //checkboxの配列を取得
                    if(input[i].type == "checkbox"){
                        arrayOfCheckBoxName.push(input[i].id);
                    }  
                }

                for (var key in returnData) {
                    for(var i=0; i < arrayOfLabelName.length; i++){
                        if(key == arrayOfLabelName[i].toUpperCase()){
                            document.getElementById(arrayOfLabelName[i]).innerText = returnData[key];
                        }
                    }
                    for(var i=0; i < arrayOfCheckBoxName.length; i++){
                        if(key == arrayOfCheckBoxName[i].toUpperCase()){
                            var checked = returnData[key] == "1" ? true : false;
                            document.getElementById(arrayOfCheckBoxName[i]).checked = checked;
                        }
                    }               
                }

                if(returnData == null){
                    alert("データがありません");
                }

                document.getElementById("company_name").parentNode.style.border = "solid 3px red";//外枠を赤に変更
                document.getElementById("customer_code").style.color = "red";//文字を赤に変更
                
                $('#sample1').css('color','red'); //文字を赤に変更
                $('#sample2').prop('checked', true);//チェックボックスにチェックを入れる
                
            }
        }
    }
    xmlhttp.open(type,url);
    xmlhttp.send(null);

}

//サーバ側処理　Visual Basic
<%@ Page Language="VB" %>
<%@ Import Namespace="System" %>
<%@ Import Namespace="System.Collections.Generic" %>
<%@ Import Namespace="System.Linq" %>
<%@ Import Namespace="System.Web" %>
<%@ Import Namespace="System.Globalization" %>
<%@ Import Namespace="System.Data" %>
<%@ Import Namespace="System.Data.OleDb" %>
<%@ Import Namespace="System.Web.Script.Serialization" %>

<SCRIPT language="VB" runat="server">

    Dim DBCONNECT As String

	Const SQL_GET_DATA As String = "select * from SampleTable where No = ?"

	Dim strErrorMsg As String

    'JSON形式で値を返却
    Protected Sub Page_Load(ByVal sender As Object, ByVal e As EventArgs)
		
        DBCONNECT = ConfigurationManager.AppSettings("SWFConnection")
		'No取得
		Dim No As String = Trim(Request.QueryString("No"))

        Response.ClearContent()
		Response.ClearHeaders()
		Response.ContentType = "text/javascript"
		Response.Output.Write(GetLatestData(No))
		Response.Flush()
		Response.End()

    End Sub

    Private Function GetLatestData(ByVal No As String) As String

		GetLatestData = "[]"
		Dim dic As Dictionary(Of String, String)
		Dim serializer As New System.Web.Script.Serialization.JavaScriptSerializer()
		Using conn As New OleDbConnection(DBCONNECT)
			Using cmd As New OleDbCommand(SQL_GET_DATA, conn)
				cmd.Parameters.Add("@NO", OleDbType.VarChar).Value = No
				conn.Open()
				Using dbRdr As OleDbDataReader = cmd.ExecuteReader()
					While dbRdr.Read()
						dic = New Dictionary(Of String, String)
						dic.Add("samplecolumn", Trim(CStr(dbRdr.Item("samplecolumn")))) //カラム名と値のハッシュ
					End While
				End Using
			End Using
		End Using
		GetLatestData = serializer.Serialize(dic)
	
	End Function  
    </SCRIPT>

//PDF表示機能
//test.html?param1=test&param2=sampleの場合
//window.location.searchをURLSearchParamsに渡す　IEだと動かない！！！
var urlParams = new URLSearchParams(window.location.search);

//param1の値を取得する
urlParams.get('param1');
//path を変数に格納
var path = urlParams.get('param1');

openPdf(path);
//新規ウィンドウでPDFを表示
function openPdf(path){
  window.open(path, null, "top=100,left=100,width=300,height=400");
}

//押下されたボタンのIDを取得
<!DOCTYPE html>
<html>
    <head>
        <script>
            function getElement(){
                let id = event.target.id;
                alert(id);
            }
        </script>
    </head>
    <body>
        <tr>
            <input type="button" name="btn1" id="ぼたん１" value="ボタン1" onclick="getElement();">
        </tr>
    </body>
</html>

//jQueryでタブの切り替え
<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8" />
  <title>jQuery UI Tabs - Default functionality</title>
  <link rel="stylesheet" href="http://code.jquery.com/ui/1.9.2/themes/base/jquery-ui.css" />
  <script src="http://code.jquery.com/jquery-1.8.3.js"></script>
  <script src="http://code.jquery.com/ui/1.9.2/jquery-ui.js"></script>
  <link rel="stylesheet" href="/demos/style.css" />
  <script>
    $(function() {
        $( "#tabs" ).tabs();
    });
  </script>
</head>
<body>
    <div id="tabs">
        <ul>
            <li><a href="#tab1">タブ1</a></li>
            <li><a href="#tab2">タブ2</a></li>
            <li><a href="#tab3">タブ3</a></li>
        </ul>
        <div id="tab1">
            <h1>tab1</h1>
        </div>
        <div id="tab2">
            <h1>tab2</h1>
        </div>
        <div id="tab3">
            <h1>tab3</h1>
        </div>
    </div>
</body>
</html>

//PDF表示
<html>
<head>
  <title>pdftest</title>
  <script type="text/javascript">
    onload = function () {
      var btn1 = document.getElementById("button1");
      btn1.onclick = function () {
        //Divの中身をクリア
        var element = document.getElementById("div_PDF").childNodes[0];
        if(element!=undefined){
          document.getElementById("div_PDF").removeChild(element);
        }
 
        //OBJECTタグを作成
        var obj = document.createElement('object');
        obj.setAttribute('id', 'objPdf');
        obj.setAttribute('classid', 'clsid:CA8A9780-280D-11CF-A24D-444553540000'); // PDFのクラスID（固定値）
        obj.setAttribute('style', 'width:500px; height:700px;');
 
        //PDFのソースを設定
        var param = document.createElement('param');
        param.setAttribute('name', 'src');
        param.setAttribute('value', 'file:///C:\\sample.pdf');
        //param.setAttribute('value', 'PDFのURLを記述');
        obj.appendChild(param);
 
        //作成したOBJECTタグをDIVタグの中にセット
        var div = document.getElementById("div_PDF");
        div.appendChild(obj);
      }
 
      var btn2 = document.getElementById("button2");
      btn2.onclick = function () {
        //Divの中身をクリア
        var element = document.getElementById("div_PDF").childNodes[0];
        if (element != undefined) {
          document.getElementById("div_PDF").removeChild(element);
        }
 
        var emb = document.createElement('embed');
        emb.setAttribute('width', '500');
        emb.setAttribute('height', '700');
        emb.src = "file:///C:\\sample.pdf";
        //emb.src ="PDFのURLを記述";
 
        //作成したOBJECTタグをDIVタグの中にセット
        var div = document.getElementById("div_PDF");
        div.appendChild(emb);
      } 
    }
  </script>
</head>
<body>
  <form id="form1">
    <div id="div_PDF" style="width:520px; height:780px; background:#ccc"></div>
    <input type="button" id="button1" onclick="button1_click" value="object PDF表示" />
    <input type="button" id="button2" onclick="button1_click" value="embed PDF表示"/>
  </form>
</body>
</html>

//PowerShellでサービスの監視　メール送信とログの出力
function Log($HostName, $Status, $Log, $ServiceName){

    # ログ出力メソッド

    # ログファイル
    $LogFile = "C:\Users\AliveMonitoring.Log"

    # ログメッセージ
    $LogMessage = "$Log, HostName:$HostName , ServiceName:$ServiceName , Status:$Status"

    # ログファイルへ追記
    Write-Output $LogMessage | Out-File $LogFile -Encoding UTF8 -Append
    
}

function SendMail($HostName, $Status, $Log, $ServiceName){

    # メール送信メソッド

    # 宛先メールアドレス
    $to = "sample@co.jp"

    # 送信元メールアドレス
    $from = "sample@co.jp"

    # SMTPサーバー
    $smtp = "127.0.0.1"
    
    # 件名
    $subject = "テストメール"

    # 本文
    [string]$body = @()
    $body = "$Log, HostName:$HostName , ServiceName:$ServiceName , Status:$Status"

    # メールを送信
    Send-MailMessage -To $to -From $from -SmtpServer $smtp -Subject $subject -Body $body -Encoding UTF8

}

# ホスト名
$HostName = Hostname

#サービス名
$ServiceName = "service"

# 実行時刻
$Log = Get-Date -Format "yyyy/MM/dd HH:mm:ss"

# サービスの状態を取得
$str = Get-Service $ServiceName

# ステータスの取得
$Status = $str.Status
$i = 0

# サービス起動処理 ステータスが"Stopped"の時、起動確認を任意の回数繰り返す
while(($Status -eq "Stopped") -and ($i -lt 5)){

    # サービススタート
    Start-Service $ServiceName
	
    # 5秒待機
    sleep 5
	
    # 再度ステータス確認
    $str = Get-Service $ServiceName
    $Status = $str.Status
    	
    $i++
	
}

# サービスの起動に失敗したらメールを送信する
if($Status -eq "Stopped"){

    SendMail "$HostName" "$Status" "$Log" "$ServiceName"

}

# ログの出力
Log "$HostName" "$Status" "$Log" "$ServiceName"


//押下されたボタンを判定
<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="utf-8">
  <title>サンプル</title>
  <script>
    window.onload = function(){
      var b1 = document.getElementById("btn1");
      var b2 = document.getElementById("btn2");
      b1.onclick = function(){
        alert("ボタン1が押されました。")
      }
      b2.onclick = function(){
        alert("ボタン2が押されました。")
      }
    };
</script>
</head>
<body>
  <input type="button" id="btn1" value="ボタン1">
  <input type="button" id="btn2" value="ボタン2">
</body>
</html>
