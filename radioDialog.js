/*
 * @Author: ymhd 
 * @Date: 2020-11-12 15:08:52 
 * @Descri: 单选弹窗集合
 * @Last Modified by: ymhd
 * @Last Modified time: 2021-03-09 15:39:56
 */

let baseData = {
    // 平台
    company: {
        url: '/auto/weixin/sys/manager/company/get?ORGTYPE=G&REGISTERED_USER_TYPE=2',
        inputText: '请选择所属平台',
        dialogText: '选择平台列表',
        nameKey: 'NAME',
        idKey: 'EASNUMBER',
        cols: [{
            key: 'NAME',
            name: '公司名称'
        }]
    },
    // 部门
    department: {
        url: `/auto/weixin/sys/manager/workwxaccount/queryDepartment`,
        inputText: '请选择成员组织',
        dialogText: '选择成员组织',
        nameKey: 'FNAME',
        idKey: 'FID',
        cols: [{
            key: 'FID',
            name: '部门ID'
        }, {
            key: 'FNAME',
            name: '部门名称'
        }]
    },
    // 员工
    person: {
        url: '/auto/weixin/sys/manager/person/get',
        inputText: '请选择员工',
        dialogText: '选择员工',
        nameKey: 'NAME',
        idKey: 'ID',
        cols: [{
            key: 'NAME',
            name: '人员名称'
        }, {
            key: 'NUMBER',
            name: '编码'
        }, {
            key: 'PHONE',
            name: '手机'
        }]
    },
    // 品牌
    brand: {
        url: '/auto/weixin/sys/manager/brand/get',
        inputText: '请选择品牌',
        dialogText: '选择品牌列表',
        nameKey: 'NAME',
        idKey: 'ID',
        cols: [{
                key: 'NAME',
                name: '品牌名称'
            },
            {
                key: 'NUMBER',
                name: '编码'
            }
        ]
    },
    // 品牌多选
    brandMult: {
        url: '/auto/weixin/sys/manager/brand/get?&REF_COMPANY=TRUE',
        inputText: '请选择品牌',
        dialogText: '选择品牌列表',
        nameKey: 'NAME',
        idKey: 'ID',
        cols: [{
                key: 'NAME',
                name: '品牌名称'
            },
            {
                key: 'NUMBER',
                name: '编码'
            }
        ],
        isSection: '2',
        showResult: true
    },
    // 车系
    series: {
        url: '/auto/weixin/sys/manager/seriesmanage/get?BRANDID={brandId}',
        inputText: '请选择车系',
        dialogText: '选择车系列表',
        nameKey: 'NAME',
        idKey: 'ID',
        cols: [{
                key: 'NAME',
                name: '品牌名称'
            },
            {
                key: 'NUMBER',
                name: '编码'
            },
            {
                key: 'BRANDNAME',
                name: '品牌'
            }
        ]
    },
    // 车型
    model: {
        url: '/auto/weixin/sys/manager/modelmanage/get?BRANDID={brandId}&SERIESID={seriesId}',
        inputText: '请选择车型',
        dialogText: '选择车型列表',
        nameKey: 'NAME',
        idKey: 'ID',
        cols: [{
                key: 'NAME',
                name: '品牌名称'
            },
            {
                key: 'NUMBER',
                name: '编码'
            },
            {
                key: 'SERIESNAME',
                name: '车系'
            },
            {
                key: 'BRANDNAME',
                name: '品牌'
            }
        ]
    },
    // 公众号列表
    gzh: {
        url: '/auto/weixin/sys/manager/pfaccount/getRef?STATUS=1',
        inputText: '请选择公众号',
        dialogText: '选择公众号列表',
        nameKey: 'WXNUMBER',
        idKey: 'ID',
        cols: [{
            key: 'WXNUMBER',
            name: '公众号名称'
        }]
    },
    miniProgram: {
        url: '/auto/weixin/sys/manager/pfaccount/queryminiprograms',
        inputText: '请选择小程序',
        dialogText: '选择小程序列表',
        nameKey: 'WXNUMBER',
        idKey: 'ID',
        cols: [{
            key: 'WXNUMBER',
            name: '小程序名称'
        }]
    },
    // 4s店列表
    ssss: {
        url: '/auto/weixin/sys/manager/company/get4S?&FISD=1',
        inputText: '请选择公司',
        dialogText: '选择公司列表',
        nameKey: 'FNAME_FULL_4S',
        idKey: 'FID',
        cols: [{
            key: 'FNAME_FULL_4S',
            name: '公司名称'
        }]
    },
    // 公司列表，貌似跟4S店是同一个接口，但Url参数有所不同
    corp: {
        url: '/auto/weixin/sys/manager/company/get4S?FISD=1&NO_REF_PFACCOUNT=1&NEED_GROUP_COMPANY=1',
        inputText: '请选择公司',
        dialogText: '选择公司列表',
        nameKey: 'FNAME_FULL_4S',
        idKey: 'FWXID',
        cols: [{
            key: 'FNAME_FULL_4S',
            name: '公司名称'
        }]
    },
    // 会员级别
    memberLevel: {
        url: '/auto/weixin/sys/manager/memberGain/queryAllValidLevel',
        inputText: '请选择会员级别',
        dialogText: '选择会员级别',
        nameKey: 'FNAME',
        idKey: 'FID',
        cols: [{
            key: 'FCODE',
            name: '会员编码'
        }, {
            key: 'FNAME',
            name: '会员名称'
        }]
    },
    // 账号
    account: {
        url: '/auto/weixin/sys/manager/bgmanager/query',
        inputText: '请选择账号',
        dialogText: '请选择账号',
        nameKey: 'NAME',
        idKey: 'ID',
        cols: [{
            key: 'LOGINID',
            name: '登录账号'
        }, {
            key: 'NAME',
            name: '用户名'
        }]
    },
    // 
    activities: {
        url: '/auto/weixin/sys/manager/enrollActivity/getList?FEASNUMBER={FEASNUMBER}&FPFACCOUNTID={FPFACCOUNTID}&MATERIAL_TAG=true',
        inputText: '请选择活动',
        dialogText: '请选择活动',
        nameKey: 'FNAME',
        idKey: 'FID',
        cols: [{
            key: 'FNAME',
            name: '活动名称'
        }, {
            key: 'FSTARTTIME',
            name: '开始时间'
        }, {
            key: 'FENDTIME',
            name: '结束时间'
        }]
    }
}
// 所有的单选选择弹窗
Vue.component('select-radio', {
    template: `
    <div class="to-dialog" :class="{'noResult':results.length === 0,'dis-abled': disabled}"  @click="toSelectDialog">
        {{showText}}
    </div>
    `,
    data() {
        return {
            results: [],
            dialogObj: null,
            baseData: {}
        }
    },
    model: {
        prop: 'category',
        event: 'complete'
    },
    props: {
        category: {
            type: Array,
            default: () => []
        },
        type: String,
        urlArgus: Object,
        extRequestData: {
            type: Object,
            default: () => {}
        },
        clearTag: Number,
        hideClearBtn: { // 隐藏清空按钮
            type: Boolean,
            default: false
        },
        // 切换集团时，更改sessionStorage的值
        changeSessionStorage: {
            type: Boolean,
            default: true
        },
        disabled: {
            type: Boolean,
            default: false
        }
    },
    mounted() {
        this.baseData = baseData[this.type]
        this.baseData.hideClearBtn = this.hideClearBtn
    },
    computed: {
        showText() {
            if (this.results.length === 0) {
                return this.baseData.inputText
            } else {
                return this.results[0][this.baseData.nameKey]
            }
        }
    },
    watch: {
        category: {
            handler(val) {
                // 平台会默认选中第一个
                if (val.length > 0 && this.type === 'company' && this.changeSessionStorage) {
                    setSessionItem('companyName', val[0].NAME)
                    setSessionItem('companyId', val[0].EASNUMBER)
                }
                this.results = val
            },
            immediate: true
        },
        clearTag(val) {
            if (+val > 0) {
                this.clearResults()
            }
        },
        extRequestData: {
            handler(val) {
                if(!!this.dialogObj) {
                    this.dialogObj.obj.extRequestData = val
                    this.dialogObj.obj.resetDialog()
                }
            },
            deep: true
        }
    },
    methods: {
        // 某些请求的URL中附带参数，此时需要对URL中的参数进行动态替换
        generateUrl(url) {
            while (url.includes('{')) {
                let key = /\{(.*?)\}/.exec(url)[1]
                let val = this.urlArgus[key] || ''
                url = url.replace(/\{(.*?)\}/, val)
            }
            return url
        },
        toSelectDialog() {
            if(this.disabled)return
            // url 未渲染的  newUrl 渲染后的
            let url = this.baseData.url
            this.baseData.newUrl = this.generateUrl(url)
            // 对弹窗进行缓存，避免产生多个相同弹窗
            if (!!this.dialogObj && !!this.dialogObj.obj) {
                this.dialogObj.obj.dialogShow = true
                this.dialogObj.obj.results = this.results
                this.dialogObj.obj.setSelectionCheck()
            } else {
                this.dialogObj = openRadioDialog(this.results, this.complete, this.baseData, this.extRequestData)
            }
        },
        complete(res) {
            // 如果是平台，每次选择完后同步修改sessionStorage
            if (this.type === 'company' && this.changeSessionStorage) {
                setSessionItem('companyName', res[0].NAME)
                setSessionItem('companyId', res[0].EASNUMBER)
            }
            this.results = res
            this.$emit('complete', res)
        },
        clearResults() {
            this.results = []
        }
    }
})

function selectRadioByBtn(type, callback, initData = [], extRequestData) {
    let dialogObj = null
    let bd = baseData[type]
    bd.newUrl = bd.url
    dialogObj = openRadioDialog(initData, callback, bd, extRequestData)
    return dialogObj
}

function openRadioDialog(initData, callback, baseData, extRequestData) {
    let tagDialog = {
        obj: null
    }
    let options = {
        data: {
            request_url: baseData.newUrl,
            extRequestData: extRequestData
        },
        methods: {
            getData() {
                let data = {
                    iDisplayStart: (this.curPage - 1) * this.pageSize,
                    iDisplayLength: this.pageSize,
                    SEARCHVALUE: this.searchVal,
                    KEYWORD_SEARCH: this.searchVal,
                    K_SEARCH: this.searchVal,
                    SECHO: 1, // 获取数据总条数
                    FREPAIRPKG_TYPE: ''
                }
                if(baseData.dialogText === '选择员工') {
                    data.WORKWX_UN_BIND_PERSON = true
                }
                Object.assign(data, this.extRequestData)
                postAjax({
                    url: this.request_url,
                    data: data
                }).then(res => {
                    if (res.success) {
                        this.dataList['page' + this.curPage] = res.data
                        this.tableData = res.data
                        this.pageNum = res.iTotalRecords
                        // 在初次加载的时候默认选中results
                        if (this.results.length > 0) {
                            this.tableData.forEach((element, index) => {
                                if (element[this.keyword] === this.results[0][this.keyword]) {
                                    this.$refs.ymTable.setCurrentRow(element)
                                }
                            })
                        }
                    }
                })
            },
            getTagContent(tag) {
                return tag[baseData.nameKey]
            },
            complete(res) {
                callback(res)
            }
        }
    };
    let props = {
        title: baseData.dialogText, // 标题
        isSection: baseData.isSection || '1', // 单选/多选
        colsData: baseData.cols, // 表格列属性
        keyword: baseData.idKey, // 标识id
        showResult: baseData.showResult || false, // 是否显示后侧结果栏
        initData: initData,
        hideClearBtn: baseData.hideClearBtn // 显示清空按钮
    };
    // 生成弹窗的容器
    let id = generateDialogContainer();
    let tpl = generateDialogTemplate(options);
    let judy = Vue.extend(tpl);
    tagDialog.obj = new judy({
        propsData: props,
    }).$mount(`#${id}`);
    return tagDialog
}

// 当账号是管理员账号时，默认选中第一个平台
function getDefaultCompany() {
    return new Promise((resolve, reject) => {
        postAjax({
            url: '/auto/weixin/sys/manager/company/get?ORGTYPE=G&REGISTERED_USER_TYPE=2',
            data: {
                iDisplayStart: 0,
                iDisplayLength: 10,
                SEARCHVALUE: '',
                KEYWORD_SEARCH: '',
                FREPAIRPKG_TYPE: ''
            }
        }).then(res => {
            if (res.data.length > 0) {
                let val = res.data.splice(0, 1)
                setSessionItem('companyName', val[0].NAME)
                setSessionItem('companyId', val[0].EASNUMBER)
            }
            resolve(res.data)
        }).catch(e => {
            reject(e)
        })
    })
}
// 默认选中第一个公司
function getDefaultCorps(cid) {
    return new Promise((resolve, reject) => {
        postAjax({
            url: `/auto/weixin/sys/manager/company/get4S?&&EASNUMBER=${cid}&FISD=1&NO_REF_PFACCOUNT=1&NEED_GROUP_COMPANY=1`,
            data: {}
        }).then(res => {
            resolve(res.data)
        }).catch(e => {
            reject(e)
        })
    })
}