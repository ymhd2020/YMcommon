/*
 * @Author: ymhd 
 * @Date: 2020-11-27 16:26:18 
 * @Last Modified by: ymhd
 * @Describe: 所有新弹窗的依赖
 * @Last Modified time: 2021-02-23 19:37:47
 */

//  创建一个弹窗容器
function generateDialogContainer() {
    let stap = (new Date()).getTime();
    $('body').append(`<div id="ymDialog${stap}"></div>`);
    return `ymDialog${stap}`;
}
// 生成弹窗tpl，用于Vue.extend()
function generateDialogTemplate(options) {
    let tpl = {
        template: `
        <el-dialog :title="title"
            :visible.sync="dialogShow"
            :close-on-click-modal="false"
            custom-class=""
            append-to-body
            >
            <div class="dialog-container">
                <div class="left-area">
                    <div class="section">
                         ${options.template || '<input type="text" placeholder="请输入关键字" v-model="searchVal"><div class="ym-search-btn iconfont" @click="toSearch">&#xe60f;</div>'}
                    </div>
                    <el-table
                        v-if="isSection === '2'"
                        :data="tableData"
                        ref="ymTable"
                        height="350"
                        border
                        style="width: 100%"
                        @select="handleSelectionChange"
                        @select-all="handleSelectionChange"
                        @row-click="clickRow"
                    >
                    <el-table-column
                        type="selection"
                        width="55">
                    </el-table-column>
                    <template v-for="(item,index) in colsData">
                        <el-table-column
                                :prop="item.key"
                                :label="item.name"
                                >
                            <template slot-scope="scope">
                                <div v-if="item.type === 'input'">
                                    <input type="number" v-model="scope.row.input" class="input-in-table" @change="tableInputBlur($event,scope)"/>
                                </div>
                                <div v-else>
                                    {{scope.row[item.key]}}
                                </div>
                            </template>
                        </el-table-column>
                    </template>
                    </el-table>
                    <el-table
                        v-if="isSection === '1'"
                        :data="tableData"
                        ref="ymTable"
                        height="350"
                        border
                        highlight-current-row
                        style="width: 100%"
                        @select="handleSelectionChange"
                        @select-all="handleSelectionChange"
                        @row-click="clickRow"
                    >
                    <template v-for="(item,index) in colsData">
                        <el-table-column
                                :prop="item.key"
                                :label="item.name"
                                >
                        </el-table-column>
                    </template>
                    </el-table>
                    <el-pagination
                      v-if="showPage"
                      :current-page="curPage"
                      background
                      layout="total,prev, pager, next"
                      @current-change="pageChange"
                      :total="pageNum">
                    </el-pagination>
                </div>
                <div class="right-area" v-if="showResult" :class="{'show-remarks': showRemarks}">
                    <div class="option">
                        当前选择（<span class="color-blue">{{results.length}}</span>）
                        <span class="color-blue" style="margin-left: 10px;cursor: pointer;" @click="clearAll">清空</span>
                    </div>
                    <div class="result">
                        <el-tag
                          :key="tag[keyword]"
                          v-for="(tag,index) in results"
                          closable
                          :disable-transitions="false"
                          @close="removeTag(tag,index)">
                          {{getTagContent(tag)}}
                        </el-tag>
                    </div>
                    <div v-if="showRemarks" class="remarks-area">
                        <div class="option">
                            发券备注（<span class="color-gray">选填，限100字</span>）
                        </div>
                        <input-len-control input-type="textarea" v-model="sendCouponRemarks"  placeholder="可备注发券背景和缘由"  :max-len="100"></input-len-control>
                    </div>
                </div>
            </div>
            <div slot="footer" class="dialog-footer">
                <el-button @click="clearAll" v-if="!hideClearBtn">清 空</el-button>
                <el-button @click="dialogShow = false">取 消</el-button>
                <el-button type="primary" @click="confirmEvent">确 定</el-button>
            </div>
        </el-dialog>
        `,
        data: {
            searchVal: '',
            everyPageData: {}, // 复选，存储每一页的选中结果
            results: [], // 选中结果
            curCheck: 0, //单选框默认选中
            dialogShow: true,
            curRow: null,
            curPage: 1,
            pageSize: 10,
            pageNum: 1,
            dataList: {},
            tableData: [],
            Vuex: $Vuex,
            sendCouponRemarks: '', // 发券备注
        },
        created() {
            if (this.initData.length > 0) this.results = this.initData
            this.pageChange(1)
        },
        props: {
            title: String,
            customClass: {
                type: String,
                default: ''
            },
            // 1 单选 2 多选
            isSection: {
                type: String,
                default: '0'
            },
            initData: {
                type: Array,
                default: () => []
            },
            colsData: {
                type: Array,
                default: () => [{
                    key: 'col1',
                    name: '列1'
                }]
            },
            showPage: {
                type: Boolean,
                default: true
            },
            dialogShowTag: Number,
            showResult: {
                type: Boolean,
                default: true
            },
            //  唯一标识key
            keyword: {
                type: String,
                default: 'FID'
            },
            // 禁止点击行数据时选中该行
            // 表格中有输入框时，focus会选中行数据
            dontTriggerSelect: {
                type: Boolean,
                default: false
            },
            // 隐藏清空按钮
            hideClearBtn: Boolean,
            // 优惠券弹窗的发券备注
            showRemarks: {
                type: Boolean,
                default: false
            }
        },
        watch: {
            // 控制弹窗显示标志，默认为0，每次累加1
            dialogShowTag(val) {
                if (val > 0) {
                    this.dialogShow = true
                    this.$nextTick(() => {
                        this.setCurrent(this.curRow)
                    })
                }
            },
            // 管理员账号下，切换平台时，清空所有弹窗的选中内容，并重新初始化弹窗数据
            'Vuex.companyId'() {
                if(this.title !== '选择平台列表') {
                    this.resetDialog()
                }
            }
        },
        mounted() {
        },
        methods: {
            resetDialog() {
                this.results = []
                this.searchVal = ''
                this.curPage = 1
                this.getData()
                this.complete([])
            },
            // results显示内容，默认显示FNAME,可通过options.methods进行同名覆盖
            getTagContent(tag) {
                return tag.FNAME
            },
            //  清空
            clearAll() {
                this.results = []
                this.$refs.ymTable.clearSelection()
                this.everyPageData = {}
            },
            removeTag(item, index) {
                this.results.splice(index, 1)
                let _i = this.tableData.findIndex(a => a[this.keyword] === item[this.keyword])
                if (_i > -1) {
                    this.$refs.ymTable.toggleRowSelection(this.tableData[_i], false)
                }
            },
            handleSelectionChange(val) {
                console.log(val)
                // this.everyPageData['page' + this.curPage] = val
                // this.results = Object.keys(this.everyPageData).reduce((pre, item) => pre.concat(this.everyPageData[item]), [])

                // 获取表格渲染数据与结果数据的交集（即选中数据）
                let common = this.results.filter(m => this.tableData.some(n => m[this.keyword] === n[this.keyword]))
                // 获取新选中数据与之前选中数据的不同集
                let arr = common.map(item => item[this.keyword]).concat(val.map(item => item[this.keyword]))
                let diff = arr.filter(item => arr.indexOf(item) === arr.lastIndexOf(item))
                diff.forEach(item => {
                    let index = this.results.findIndex(a => a[this.keyword] === item)
                    // 如果存在于结果数据中，则删除，不存在则新增
                    if (index > -1) {
                        this.results.splice(index, 1)
                    } else {
                        let i = this.tableData.findIndex(a => a[this.keyword] === item)
                        this.results.push(this.tableData[i])
                    }
                })
            },
            setSelectionCheck() {
                this.$nextTick(() => {
                    this.tableData.forEach((item, index) => {
                        if (this.results.some(a => a[this.keyword] === item[this.keyword])) {
                            this.$refs.ymTable.toggleRowSelection(this.tableData[index], true)
                        } else {
                            this.$refs.ymTable.toggleRowSelection(this.tableData[index], false)
                        }
                    })
                })
            },
            // 单选
            clickRow(val) {
                if (!!this.dontTriggerSelect) return
                if (this.isSection === '2') {
                    this.$refs.ymTable.toggleRowSelection(val)
                    let index = this.results.findIndex(item => item[this.keyword] === val[this.keyword])
                    if (index > -1) {
                        this.results.splice(index, 1)
                    } else {
                        this.results.push(val)
                    }
                } else {
                    this.results = [val]
                }
            },
            setCurrent(row) {
                this.$refs.ymTable.setCurrentRow(row)
                this.results = [row]
            },
            confirmEvent() {
                // 如果有发券备注
                if(this.showRemarks) {
                    this.complete({
                        result: this.results,
                        remark: this.sendCouponRemarks
                    })
                }else {
                    this.complete(this.results)
                }
                this.dialogShow = false
            },
            toSearch() {
                this.dataList = {} // 清除缓存数据
                this.pageChange(1)
            },
            pageChange(val) {
                this.curPage = val
                if (!this.dataList['page' + this.curPage]) {
                    this.getData()
                } else {
                    this.tableData = this.dataList['page' + this.curPage]
                    this.setSelectionCheck()
                }
            },
        }
    }
    const lifecycle = ['beforecreate ','created ','mounted','beforeDestroy']
    Reflect.deleteProperty(options, 'template')

    Object.keys(options).forEach(key => {
        if(lifecycle.includes(key)) {
            let ori_lifecycle = tpl[key]
            tpl[key] = function(){
                ori_lifecycle && ori_lifecycle.call(this, null)
                options[key].call(this, null)
            }
        }else {
            tpl[key] = Object.assign({}, tpl[key], options[key])
        }
    })
    const temp = tpl.data
    tpl.data = function () {
        return temp
    }
    return tpl
}

// 控制字数Input框 
Vue.component('input-len-control', {
    template: `
    <div class="input-control-wrapper">
        <input v-if="inputType==='input'" type="text" v-model="input" @input="inputControl($event.target.value)" :placeholder="placeholder">
        <textarea v-else v-model="input" @input="inputControl($event.target.value)" :placeholder="placeholder"></textarea>
        <span class="control">{{curLen}}/{{maxLen}}</span>
    </div>
    `,
    data() {
        return {
            curLen: 0,
            input: ''
        }
    },
    model: {
        prop: 'inputValue',
        event: 'change'
    },
    props: {
        inputType: {
            type: String,
            default: 'input'
        },
        maxLen: {
            type: Number,
            default: 16
        },
        placeholder: String,
        inputValue: {
            type: String,
            default: ''
        }
    },
    watch: {
        inputValue: {
            handler(val) {
                if (Object.prototype.toString.call(val) === '[object String]') {
                    const {
                        returnStr,
                        len
                    } = getTagLen(val, this.maxLen)
                    this.curLen = len
                    this.input = returnStr
                }
            },
            immediate: true
        }
    },
    mounted() {
        this.input = this.inputValue
    },
    methods: {
        inputControl(val) {
            const {
                returnStr,
                len
            } = getTagLen(val, this.maxLen)
            this.curLen = len
            this.input = returnStr
            this.$emit('change', returnStr)
        }
    }
})

function getTagLen(str, maxLen) {
    let reg = /^[\u4e00-\u9fa5]{0,}$/;
    let len = 0;
    let returnStr = "";
    if (str === "") {
        return {
            returnStr,
            len
        }
    }
    str = str.split('');
    for (let i = 0; i < str.length; i++) {
        if (reg.test(str[i])) {
            if (len >= maxLen - 1) break;
            len += 2;
        } else {
            len++;
        }
        returnStr += str[i];
        if (len >= maxLen) break;
    }
    return {
        returnStr,
        len
    }
}