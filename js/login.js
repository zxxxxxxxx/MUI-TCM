var moduleName = require("qcloudsms_js")

// var QcloudSms = require("qcloudsms_js");
var appid = 1400104442;
var appkey = "3cc93fb8c7eba5f054b88804e07edd55";
var phoneNumbers = document.getElementById("phonenumber").value;
var templId = 145305;
var qcloudsms = QcloudSms(appid, appkey);
// 请求回调处理, 这里只是演示，用户需要自定义相应处理回调
function callback(err, res, resData) {
    if (err)
        console.log("err: ", err);
    else
        console.log("response data: ", resData);
}

var ssender = qcloudsms.SmsSingleSender();
var params = ["指定模板单发", "深圳", "小明"];
console.log(phoneNumbers);
function sendSms() {
    var  send = document.getElementById('send');
    send.addEventListener('click', function (event) {
        console.log("click");
        // ssender.sendWithParam(86, phoneNumbers, templId,
        //     params, "", "", "", callback);
    });
}

sendSms();