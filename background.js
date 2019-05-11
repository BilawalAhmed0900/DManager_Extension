var sUsrAg = window.navigator.userAgent;
var browserVar;
if (sUsrAg.indexOf("Chrome") > -1)
{
    browserVar = chrome;
}
else
{
    browserVar = browser;
}

var socket = new WebSocket("ws://127.0.0.1:49152");
var toDownloadMime = [
    "text/html",
    "text/css",
    "text/javascript",
    "text/mspg-legacyinfo",
    "text/plain",
    "text/srt",
    "text/vtt",
    "text/xml",
    "text/x-javascript",
    "text/x-json",
    "application/f4m+xml",
    "application/gzip",
    "application/javascript",
    "application/json",
    "application/msword",
    "application/pdf",
    "application/ttaf+xml",
    "application/vnd.apple.mpegurl",
    "application/zip",
    "application/x-7z-compressed",
    "application/x-aim",
    "application/x-compress",
    "application/x-compress-7z",
    "application/x-compressed",
    "application/x-dosexec",
    "application/x-gtar",
    "application/x-gzip",
    "application/x-gzip-compressed",
    "application/x-javascript",
    "application/x-mpegurl",
    "application/x-msdos-program",
    "application/x-msi",
    "application/x-msp",
    "application/x-ole-storage",
    "application/x-rar",
    "application/x-rar-compressed",
    "application/x-sdlc",
    "application/x-shockwave-flash",
    "application/x-silverlight-app",
    "application/x-subrip",
    "application/x-tar",
    "application/x-zip",
    "application/x-zip-compressed",
    "ilm/tm",
    "image/gif",
    "image/icon",
    "image/jpg",
    "image/jpeg",
    "image/png",
    "image/tiff",
    "image/vnd.microsoft.icon",
    "image/webp",
    "image/x-icon",
    "flv-application/octet-stream",
    "application/x-iso9660-image",
    "application/octet-stream"
];

function sendUsingCookies(downloadItem, _cookies)
{
    var index;
    var cookies = "";
    if (_cookies != null)
    {
        for (index = 0; index < _cookies.length; index++)
        {
            cookies = cookies + _cookies[index].name + "=" + _cookies[index].value + "; ";
        }
    }
    
    
    var toBeSent = JSON.stringify({"filename": downloadItem.filename, "url": downloadItem.url, "finalUrl": downloadItem.finalUrl || "",
                        "referrer": downloadItem.referrer || "", "fileSize": downloadItem.fileSize, "mime": downloadItem.mime, 
                        "cookies": cookies, "youtube_link": false});
    socket.send(toBeSent + "\0");
    
    browserVar.downloads.cancel(downloadItem.id);
    browserVar.downloads.erase({"id": downloadItem.id});
}

function updater_function(downloadItem)
{
    if (downloadItem.url != "" && downloadItem.url.indexOf("ftp://") == -1 && downloadItem.url.indexOf("blob:") == -1)
    {
        var audioRegex = /audio\/.*/gm
        var videoRegex = /video\/.*/gm
        var audioFound;
        var videoFound;
        if (socket.readyState == 1 && (toDownloadMime.indexOf(downloadItem.mime) > -1 || ((audioFound = audioRegex.exec(downloadItem.mime)) != null) || ((videoFound = videoRegex.exec(downloadItem.mime)) != null)))
        {
            browserVar.cookies.getAll({"url": downloadItem.url}, function(_cookies)
                {
                    sendUsingCookies(downloadItem, _cookies);  
                });
        }
    }
    
};

browserVar.downloads.onCreated.addListener(updater_function);