//JavaScript Sample Program
//ウィンドウ×閉じボタン押下時のイベント取得
var result = false; //window.onbeforeunloadの条件分岐用
window.onload = function(){

    //×ボタン以外に画面遷移のボタンがあれば処理を分ける
    var btn1  = document.getElementById("button1");
    btn1.onclick  = function(){
        result = true;
    }
}
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
                const id = event.target.id;
                alert(id);                
                const array = ["リンゴ", "ばなな", "オレンジ"];
                alert(array);
                const val = document.getElementById("label");
                alert(val.value);
                //document.getElementById("label").value = array;
            }
        </script>
    </head>
    <body>
        <tr>
            <input type="button" name="btn1" id="ぼたん１" value="ボタン1" onclick="getElement();">
        </tr>
        <tr>
            <input type="label" id="label" value="ばりゅー">
        </tr>
    </body>
</html>
