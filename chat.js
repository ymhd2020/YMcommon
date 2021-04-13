/*
 * @Author: ymhd 
 * @Date: 2020-12-04 11:48:05 
 * @Last Modified by: ymhd
 * @Describe: 客服聊天组件
 * @Last Modified time: 2021-02-23 10:56:56
 */

Vue.component('ym-chat', {
    template: `
    <div class="ym-chat-wrap" v-if="!!curChatObj.FOPENID">
        <div class="ym-chat-top">
            {{curChatObj.FWXNAME || '无名'}}
        </div>
        <div class="ym-chat-status" v-if="curChatObj.FSTATUS === 2" style="color:#999999;">
            已超时
        </div>
        <div class="ym-chat-status" v-if="curChatObj.FSTATUS === 1">
            会话中
            <el-button size="small" @click="closeChat">结束会话</el-button>
        </div>
        <div class="ym-chat-status" v-if="curChatObj.FSTATUS === 0" style="color:#F7855C;">
            待处理
        </div>
        <div class="ym-chat-main" ref="msgMain">
            <div class="load-more" @click="loadMore" v-if="showLoadMore">加载更多消息</div>
            <ul>
                <template v-for="item in msgList">
                    <li class="ym-chat-time" v-if="!!item.type && (item.type === 'time')">
                        {{item.msg}}
                    </li>
                    <li :class="{'ym-chat-obj': item.MSGFROM === 1}" v-else>
                        <img :src="curChatObj.FHEADIMGURL || '/auto/images/default_head.jpg'" alt="" v-if="item.MSGFROM === 1">
                        <img :src="item.PERSONIMGURL || '/auto/images/default_head.jpg'" alt="" v-else>
                        <div class="ym-chat-msg">
                            {{item.TEXTMESG}}
                        </div>
                    </li>
                </template>
            </ul>
        </div>
        <div class="ym-chat-send">
            <textarea placeholder="请输入要回复的内容，点击发送按钮/回车即可发送" v-model="chatMsg" @keyup.enter="sendMsg">
            </textarea>
            <el-button type="primary" size="small" @click="sendMsg">发送</el-button>
        </div>
    </div>
    <div v-else class="no-chat-data"> 
        <img src="/auto/images/noChatData.png" style="width:140px">
        暂无数据
    </div>
    `,
    data() {
        return {
            chatMsg: '',
            curChatObj: {},
            hasConnet: false, // 连接对话
            LAST_TIME: '', // 上次获取列表的时间，默认是现在
            LAST_SESSION_TIME: '',
            msgList: [],
            showLoadMore: false, // 显示加载更多
            sending: false, // 消息发送中
        }
    },
    props: {
        chatObj: Object
    },
    computed: {
        // 当前加载的第一条消息
        startTime() {
            return this.msgList.length > 0 ? this.msgList[0].CREATETIME : ''
        }
    },
    mounted() {
        this.startLoop()
    },
    watch: {
        chatObj: {
            handler(val) {
                this.curChatObj = val
                this.clearAll()
                if (!!val.FOPENID) {
                    this.initMsg()
                }
            },
            immediate: true
        }
    },
    methods: {
        async initMsg() {
            try {
                let res = await this.loadMoreEvent()
                if (res.success) {
                    this.msgList = this.packMsgList(res.data)
                    this.showLoadMore = res.data.length === 10
                    this.LAST_SESSION_TIME = res.data[res.data.length - 1].CREATETIME
                    this.scrollToBottom()
                }
            } catch {
                return false
            }
        },
        // 获取历史消息
        async loadMoreEvent() {
            return new Promise((resolve, reject) => {
                postAjax({
                    url: '/auto/weixin/sys/manager/chatsession/queryHis',
                    data: {
                        OPENID: this.curChatObj.FOPENID,
                        ACCOUNTID: this.curChatObj.FPFACCOUNTID,
                        ENDTIME: this.startTime,
                    }
                }).then(res => {
                    resolve(res)
                })
            })
        },
        //  加载更多历史消息
        async loadMore() {
            let res = await this.loadMoreEvent()
            if (res.success) {
                this.msgList = this.packMsgList(res.data).concat(this.msgList)
                this.showLoadMore = res.data.length === 10
            }
        },
        // 获取聊天列表
        getChatMsg() {
            return new Promise((resolve, reject) => {
                postAjax({
                    url: '/auto/weixin/sys/manager/chatsession/pullMsg',
                    data: {
                        OPENID: this.curChatObj.FOPENID,
                        ACCOUNTID: this.curChatObj.FPFACCOUNTID,
                        PERSONID: this.curChatObj.FPERSONID,
                        LAST_SESSION_TIME: this.LAST_SESSION_TIME,
                        LAST_TIME: this.LAST_TIME,
                    }
                },false).then(res => {
                    resolve(res)
                }).catch(re => {
                    reject()
                })
            })
        },
        // 连接对话
        connectChat() {
            return new Promise((resolve, reject) => {
                postAjax({
                    url: '/auto/weixin/sys/manager/chatsession/markUnConnSession',
                    data: {
                        OPENID: this.curChatObj.FOPENID,
                        ACCOUNTID: this.curChatObj.FPFACCOUNTID
                    }
                }).then(res => {
                    if (res.success) {
                        this.hasConnet = true
                        this.curChatObj.FSTATUS = 1
                        this.$emit('change')
                        resolve()
                    } else {
                        reject('连接失败')
                    }
                })
            })
        },
        // 结束对话
        closeChat() {
            postAjax({
                url: '/auto/weixin/sys/manager/chatsession/closeSession',
                data: {
                    OPENID: this.curChatObj.FOPENID,
                    ACCOUNTID: this.curChatObj.FPFACCOUNTID
                }
            }).then(res => {
                if (res.success) {
                    this.curChatObj = {}
                    this.$emit('change')
                }
            })
        },
        // 发送消息
        async sendMsg() {
            // 发送消息前先进行连接
            if (!this.hasConnet) {
                // 已超时状态不进行连接
                if (+this.curChatObj.FSTATUS !== 2) {
                    try {
                        await this.connectChat() // 每次打开聊天窗口，重连一次
                    } catch (err) {
                        showDefaultTips(err, "", 3);
                        return
                    }
                }
            }
            // 避免多次发送
            if (this.sending) return
            this.sending = true
            // 去除消息的首位空格
            this.chatMsg = this.chatMsg.replace(/^(\s|\u00A0)+/, '').replace(/(\s|\u00A0)+$/, '')

            postAjax({
                url: '/auto/weixin/sys/manager/chatsession/pushMsg',
                data: {
                    OPENID: this.curChatObj.FOPENID,
                    ACCOUNTID: this.curChatObj.FPFACCOUNTID,
                    PERSONID: this.curChatObj.FPERSONID,
                    MSGTYPE: 'TXT',
                    TXTMSG: this.chatMsg,
                    IMGID: ''
                }
            }).then(res => {
                if (res.success) {
                    this.chatMsg = ''
                    this.sending = false
                    this.scrollToBottom()
                }
            })
        },
        // 开始轮询
        async startLoop() {
            setTimeout(() => {
                this.startLoop()
            }, 1000)
            try {
                let res = await this.getChatMsg()
                if (res.success) {
                    this.LAST_SESSION_TIME = res.LAST_SESSION_TIME
                    this.LAST_TIME = res.LAST_TIME
                    // 列表发生变化
                    if (res.sessionChange) {
                        this.$emit('change')
                    }
                    if (res.msgList.length > 0) {
                        this.msgList = this.msgList.concat(this.packMsgList(res.msgList, this.msgList[this.msgList.length - 1].CREATETIME))
                        this.scrollToBottom()
                    }
                }
            } catch {}
        },
        // 清空
        clearAll() {
            this.hasConnet = false // 切换当前对象时，断开连接
            this.showLoadMore = false
            this.sending = false
            this.LAST_SESSION_TIME = ''
            this.msgList = []
        },
        // list 组装数据
        // lastTime 上一条消息的时间
        packMsgList(list, lastTime = '') {
            let res = []
            list.forEach(element => {
                if(!!element.PERSONIMGURL) {
                    element.PERSONIMGURL = '/' + element.PERSONIMGURL
                }
                // 第一条默认显示时间
                if (res.length === 0) {
                    if (lastTime === '' || this.timeCompare(lastTime, element.CREATETIME)) {
                        res.push({
                            msg: new Date(element.CREATETIME).Format('yy-MM-dd hh:mm:ss'),
                            type: 'time',
                            CREATETIME: element.CREATETIME
                        })
                    }
                } else {
                    // 如果两个消息的之间间距大于3分钟，插入时间
                    if (!!res[res.length - 1].CREATETIME && this.timeCompare(res[res.length - 1].CREATETIME, element.CREATETIME)) {
                        res.push({
                            msg: new Date(element.CREATETIME).Format('yy-MM-dd hh:mm:ss'),
                            type: 'time',
                            CREATETIME: element.CREATETIME
                        })
                    }
                }
                res.push(element)
            })
            return res
        },
        // 深拷贝
        // deeoCopyObj() {
        //     let data = this.dataCache[this.curChatObj.FOPENID]
        //     let obj = {}
        //     Object.keys(data).forEach(key => {
        //         if (Object.prototype.toString.call(data[key]) === '[object Array]') {
        //             obj[key] = data[key].map(item => item)
        //         } else {
        //             obj[key] = data[key]
        //         }
        //     })
        //     return obj
        // },
        // setDataCache(obj, tag = true) {
        //     this.$set(this.dataCache, this.curChatObj.FOPENID, obj)
        //     if (tag) {
        //         setTimeout(() => {
        //             this.scrollToBottom()
        //         }, 0)
        //     }
        // },
        timeCompare(pre, cur) {
            let diff = getTimeDiffByType(cur, pre, 'minute')
            if (diff >= 3) {
                return true
            }
            return false
        },
        scrollToBottom() {
            this.$nextTick(() => {
                this.$refs.msgMain.scrollTop = this.$refs.msgMain.scrollHeight
            })
        },
    }
})