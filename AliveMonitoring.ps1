#サービスの監視　メール送信とログの出力
# ログ出力メソッド
function Log($HostName, $Status, $Log, $ServiceName){
    # ログファイル
    $LogFile = "C:\Users\AliveMonitoring.Log"
    # ログメッセージ
    $LogMessage = "$Log, HostName:$HostName , ServiceName:$ServiceName , Status:$Status"
    # ログファイルへ追記
    Write-Output $LogMessage | Out-File $LogFile -Encoding UTF8 -Append    
}
# メール送信メソッド
function SendMail($HostName, $Status, $Log, $ServiceName){
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