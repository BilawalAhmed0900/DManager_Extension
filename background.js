const sUsrAg = window.navigator.userAgent;
const isFirefox = (sUsrAg.indexOf("Chrome") === -1);
const browserVar = (!isFirefox) ? chrome : browser;
const socket = new WebSocket("ws://127.0.0.1:49152");
const toDownloadMime = [
    "application/f4m+xml",
    "application/gzip",
    "application/msword",
    "application/pdf",
    "application/ttaf+xml",
    "application/vnd.apple.mpegurl",
	"application/rar",
    "application/zip",
    "application/x-7z-compressed",
    "application/x-aim",
    "application/x-compress",
    "application/x-compress-7z",
    "application/x-compressed",
	"application/x-lzma",
	"application/x-lzma-compressed",
    "application/x-dosexec",
    "application/x-gtar",
    "application/x-gzip",
    "application/x-gzip-compressed",
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
	"application/x-msdownload",
    "application/x-zip",
    "application/x-zip-compressed",
    "application/x-iso9660-image",
    "application/octet-stream",
	"application/binary",
	"binary/octet-stream",
    "flv-application/octet-stream"
];

function sendUsingCookies(downloadItem, _cookies, isAudio, isVideo, isExecutable)
{
    let cookies = "";
    if (_cookies != null)
    {
        for (let index = 0; index < _cookies.length; index++)
        {
            cookies = cookies + _cookies[index].name + "=" + _cookies[index].value + "; ";
        }
    }
    
    const toBeSent = JSON.stringify({"filename": downloadItem.filename, "url": downloadItem.url, "finalUrl": downloadItem.finalUrl || downloadItem.url,
                        "referrer": downloadItem.referrer || "", "fileSize": downloadItem.fileSize, "mime": downloadItem.mime, 
                        "cookies": cookies, "youtubeLink": false, "isAudio": isAudio, "isVideo": isVideo, "isExecutable": isExecutable, 
						"userAgent": sUsrAg});
    socket.send(toBeSent);
}

function updater_function(downloadItem)
{
	console.log(downloadItem);
	const audioRegex = /audio\/.*/
	const videoRegex = /video\/.*/
	
	const audioFound = (audioRegex.exec(downloadItem.mime) != null);
	const videoFound = (videoRegex.exec(downloadItem.mime) != null);
	if ((socket.readyState === 1 && downloadItem.url !== "" && downloadItem.url.indexOf("ftp://") === -1 && downloadItem.url.indexOf("blob:") === -1) &&
		(toDownloadMime.indexOf(downloadItem.mime) > -1 || audioFound || videoFound))
    {
		browserVar.downloads.cancel(downloadItem.id);
		browserVar.downloads.erase({"id": downloadItem.id});
        browserVar.cookies.getAll({"url": downloadItem.url}, function(_cookies)
		{
			sendUsingCookies(downloadItem, _cookies, audioFound, videoFound, false);
		});
    }
};

function contextMenuDownloadFunction(info, tab)
{
	console.log(info);
	const downloadItem = {
		filename: "",
		url: info.linkUrl,
		finalUrl: info.linkUrl,
		referrer: info.pageUrl,
		fileSize: -1,
		mime: ""
	};
	browserVar.cookies.getAll({"url": downloadItem.url}, function(cookies)
	{
		sendUsingCookies(downloadItem, cookies, false, false, false);
	});
}

function contextMenuTransferDownloadFunction(info, tab)
{
	console.log(info);
	browserVar.downloads.search(
	{
		finalUrl: info.linkUrl
	},
	(downloadItems) =>
	{
		console.log(downloadItems);
		for (const downloadItem of downloadItems)
		{
			browserVar.downloads.cancel(downloadItem.id);
			browserVar.downloads.erase({"id": downloadItem.id});
		}
	});
	const downloadItem = {
		filename: "",
		url: info.linkUrl,
		finalUrl: info.linkUrl,
		referrer: info.pageUrl,
		fileSize: -1,
		mime: ""
	};
	browserVar.cookies.getAll({"url": downloadItem.url}, function(cookies)
	{
		sendUsingCookies(downloadItem, cookies, false, false, false);
	});
}

browserVar.downloads.onCreated.addListener(updater_function);
browserVar.contextMenus.create(
{
	title: "Download with LinkDownloader",
	contexts: ["link"],
	documentUrlPatterns: ["http://*/*", "https://*/*"],
	onclick: contextMenuDownloadFunction
});

// This is only supported in Chrome
if (!isFirefox)
{
	browserVar.contextMenus.create(
	{
		title: "Transfer download to LinkDownloader",
		contexts: ["link"],
		documentUrlPatterns: ["chrome://downloads/"],
		onclick: contextMenuTransferDownloadFunction
	});
}

