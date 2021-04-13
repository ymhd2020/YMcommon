/*
 * @Author: ymhd 
 * @Date: 2020-11-30 15:23:23 
 * @Last Modified by: ymhd
 * @Describe: 一些通用的函数，mixin以及Vue filter
 * @Last Modified time: 2021-01-14 20:38:17
 */

// 全局变量  VueX
var $Vuex = {
    token: sessionStorage.getItem('token'),
    companyId: sessionStorage.getItem('companyId'),
    companyName: sessionStorage.getItem('companyName')
}

function setSessionItem(key, val) {
    if (key === 'companyId') {
        $Vuex.companyId = val
    }
    if (key === 'companyName') {
        $Vuex.companyName = val
    }
    sessionStorage.setItem(key, val)
}
Vue.mixin({
    data() {
        return {
            isManage: sessionStorage.getItem('isSysAdminOrKDAdmin') === 'true', // 管理员账号
            isKX: sessionStorage.getItem("groupType") === "1", // 快修
            isWX: sessionStorage.getItem("groupType") === "2", // 微信
        }
    },
    methods: {
        YMJumpTo(url) {
            jumpwithtoken('/auto/weixin/sys/manager/' + url)
        }
    }
})


// 用Promise封装的Ajax
function postAjax(option, showError=true) {
    // 请求参数中默认EASNUMBER和ACCESS_SESSION_TOKEN
    let request_data = Object.assign({}, {
        FEASNUMBER: $Vuex.companyId,
        EASNUMBER: $Vuex.companyId,
        ACCESS_SESSION_TOKEN: $Vuex.token
    }, (option.data || {}))
    return new Promise((resolve, reject) => {
        jQuery.ajax({
            type: "post",
            url: option.url,
            data: request_data,
            dataType: "json",
            success: function (res) {
                if (res && res.success) {
                    resolve(res);
                } else {
                    if(showError)showDefaultTips(res.error_message, "", 3, 1000);
                    reject(res);
                }
            },
            error: function () {
                if(showError) {
                    showDefaultTips('系统异常T_T', "", 3, 1000);
                }
                reject({success:false})
            }
        });
    });
}
// 从sessionStorage获取平台Id，token,平台名称
function getStorage() {
    return {
        companyid: window.sessionStorage.getItem('companyId'),
        token: window.sessionStorage.getItem('token'),
        companyname: window.sessionStorage.getItem('companyName'),
    }
}
// 对日期格式化
Date.prototype.Format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, // 月份
        "d+": this.getDate(), // 日
        "h+": this.getHours(), // 小时
        "m+": this.getMinutes(), // 分
        "s+": this.getSeconds(), // 秒
        "q+": Math.floor((this.getMonth() + 3) / 3), // 季度
        "S": this.getMilliseconds() // 毫秒
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + ""));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1,
            (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}
// 使用： new Date(1542274800000).Format('yy-MM-dd hh:mm:ss');

// 定义了一个Vue filter，功能同上
Vue.filter('dateFilter', function (value) {
    if (/^[0-9]*$/.test(value)) {
        return new Date(value).Format('yyyy-MM-dd')
    } else {
        return value
    }
})

function addZero(item) {
    return item < 10 ? "0" + item : item;
}
// 获取指定日期的前N天日期，startDay默认当天
function getDate(start, end, startDay) {
    let day = !!startDay ? new Date(startDay) : new Date();
    day.setTime(day.getTime() + start * 24 * 60 * 60 * 1000);
    let s1 =
        day.getFullYear() +
        "-" +
        addZero(day.getMonth() + 1) +
        "-" +
        addZero(day.getDate());
    let day1 = !!startDay ? new Date(startDay) : new Date();
    day1.setTime(day1.getTime() + end * 24 * 60 * 60 * 1000);
    let s2 =
        day1.getFullYear() +
        "-" +
        addZero(day1.getMonth() + 1) +
        "-" +
        addZero(day1.getDate());
    return {
        startDate: s1,
        endDate: s2,
    };
}
// 节流，用于搜索框联想输入
function throttle(fn, delay) {
    let flag = true, // 加锁
        timer = null;
    return function (...args) {
        let context = this;
        if (!flag) return; // 如果还在固定频率内，不进行任何操作直接返回
        flag = false;
        clearTimeout(timer);
        timer = setTimeout(function () {
            fn.apply(context, args);
            flag = true;
        }, delay)
    }
}
// 将时间转换为13位时间戳
function swtichToTimestamp(time) {
    time += ''
    if (/^[0-9]*$/.test(time)) { // 时间戳
        if (time.length > 13) {
            time = time.slice(0, 13)
        } else {
            time = time + Array(14 - time.length).join("0")
        }
    } else { // 时间
        time = new Date(time).getTime()
    }
    return +time
}

// 比较两个时间之间的差时
function getTimeDiffByType(time1, time2, type) {
    let diff = time1 - time2
    let base = 1000
    switch (type) {
        case 'day':
            base = base * 60 * 60 * 24
            break
        case 'hour':
            base = base * 60 * 60
            break
        case 'minute':
            base = base * 60
            break
    }
    return diff/base | 0
}
// 复制到剪贴板
function copyToClipboard(val) {
    let aux = document.createElement("input");
    aux.setAttribute("value", val);
    document.body.appendChild(aux);
    aux.select();
    document.execCommand("copy");
    document.body.removeChild(aux);
    showDefaultTips('已成功复制到剪贴板','',1)
}

// 获取url参数
function getQueryVariable() {
    let query = window.location.search.substring(1);
    let vars = query.split("&");
    let res = {};
    for (let i = 0; i < vars.length; i++) {
        let pair = vars[i].split("=");
        if (pair[0] !== "") {
            let val = decodeURIComponent(pair[1]);
            if (val.includes("|")) {
                val = val
                    .split("|")
                    .filter((item) => item !== "")
                    .join(",");
            }
            if (val === "null") val = "";

            res[pair[0]] = val;
        }
    }
    return res;
}