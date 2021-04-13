/*
 * @Author: ymhd 
 * @Date: 2020-11-17 10:32:01 
 * @Describe: 标签弹窗三级联动
 * @Last Modified by: ymhd
 * @Last Modified time: 2021-02-08 10:40:48
 */
function generateYMTagTpl(callback) {
    let brand_tpl = {
        template: `
        <el-dialog title="标签"
            :visible.sync="dialogShow"
            :close-on-click-modal="false"
            custom-class=""
            append-to-body
            >
            <div class="dialog-container">
                <div class="left-area brand-left-area">
                    <div class="section tag-special-require">
                        <input type="text" placeholder="请输入标签名称" v-model="searchVal" @input="searchChange" style="width:400px;">
                        <el-button size="small" type="primary" @click="toSearch" style="margin-left:10px">搜索</el-button>
                        <el-button size="small" @click="clearSearch">清空</el-button>
                        <div class="search-result-area" v-if="showSearchResults && searchResults.length > 0">
                            <ul>
                                <li v-for="item in searchResults" @click="preciseSearch(item)">{{item.LEVEL_1_NAME}} > {{item.LEVEL_2_NAME}} > <span>{{searchVal}}</span></li>
                            </ul>
                        </div>
                    </div>
                    <div class="select-car-container">
                        <div class="brand-container">
                            <ul>
                                <li v-for="par in firstCategory" class="par-node">
                                    <div class="letter-title">{{par.LETTER}}</div>
                                    <ul>
                                        <li v-for="item in par.nodes" :class="{'selected':item.FID === firstSelect.FID}" @click="selectFirstCategory(item)">
                                            {{item.FNAME}}
                                        </li>
                                    </ul>
                                </li>
                            </ul>
                        </div>
                        <div class="series-container">
                            <ul>
                                <li v-for="item in secondCategory" :class="{'selected':item.FID === secondSelect.FID}"  @click="selectSecondCategory(item)">
                                    {{item.FNAME}}
                                </li>
                            </ul>
                        </div>
                        <div class="carData-container" style="width:250px;">
                            <template v-if="isMult && tagData.length > 0">
                                <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">全选</el-checkbox>
                            </template>
                            <el-checkbox-group 
                            v-model="checkedDatas" 
                            @change="handleCheckedCitiesChange" 
                            >
                                <el-checkbox @change="singleSelect(item)" v-for="item in tagData" :label="item.FTAGID" :key="item.FTAGID" :title="item.FNAME">{{item.FNAME}}</el-checkbox>
                            </el-checkbox-group>
                        </div>
                    </div>
                    <el-pagination :current-page="curPage" background total @current-change="pageChange"
                        layout="total, prev, pager, next" :total="total" style="text-align:right">
                    </el-pagination>
                </div>
                <div class="right-area" style="width:340px;">
                    <div class="option">
                        当前选择（<span class="color-blue">{{results.length}}</span>）
                        <span class="color-blue" style="margin-left: 10px;cursor: pointer;" @click="clearAll">清空</span>
                    </div>
                    <div class="result">
                        <el-tag
                        :title="item.tagName"
                        :key="item.secondId + item.tagId"
                        v-for="(item,index) in results"
                        closable
                        :disable-transitions="false"
                        @close="removeSelect(item)">
                        {{item.firstName}}-{{item.secondName}}-{{item.tagName}}
                        </el-tag>
                    </div>
                </div>
            </div>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogShow = false">取 消</el-button>
                <el-button type="primary" @click="confirmEvent">确 定</el-button>
            </div>
        </el-dialog>
        `,
        data() {
            return {
                searchVal: '',
                // 一级分类
                firstCategory: [],
                firstSelect: {},
                // 二级分类
                secondCategory: [],
                secondSelect: {},
                tagData: [],
                results: [],
                checkAll: false,
                isIndeterminate: false,
                checkedDatas: [],
                dialogShow: true,
                // 标签分页
                curPage: 1,
                pageSize: 10,
                total: 0,

                showSearchResults: false,
                searchResults: [],
                searchMethod: null,
                // 精准搜索Item
                curPerciseFilterItem: null,

                Vuex: $Vuex // 缓存全局，触发watch
            }
        },
        created() {
            this.getFirstCategory()
        },
        props: {
            // 多选
            isMult: Boolean
        },
        watch: {
            firstSelect: {
                handler(val) {
                    this.getSecondCategory()
                },
                immediate: false
            },
            secondSelect: {
                handler(val) {
                    this.curPage = 1
                    this.getTags()
                    this.checkAll = false
                    this.checkedDatas = []
                },
                immediate: false
            },
            // 切换平台时，重新获取数据，并清空选择的内容
            'Vuex.companyId'() {
                this.clearSearch()
                this.results = []
                callback([])
            }
        },
        mounted() {
            this.initSearchMethods()
        },
        methods: {
            // 初始化搜索节流
            initSearchMethods() {
                this.searchMethod = throttle(() => {
                    postAjax({
                        url: '/auto/weixin/sys/manager/accountgroup/getUserTagsList',
                        data: {
                            SEARCH_TAG_WITH_TYPE: true,
                            KW_SEARCH: this.searchVal
                        }
                    }).then(res => {
                        this.searchResults = res.DATA
                    })
                }, 500)
            },
            searchChange(e) {
                if(this.searchVal !== '') {
                    this.showSearchResults = true
                    this.searchMethod()
                }else {
                    this.showSearchResults = false
                }
            },
            selectFirstCategory(item) {
                this.firstSelect = item
            },
            selectSecondCategory(item) {
                this.secondSelect = item
            },
            // 全选
            handleCheckAllChange(val) {
                let data = this.tagData.map(item => item.FTAGID)
                let result = this.checkedDatas.slice(0)
                this.checkedDatas = !!val ?
                    data.concat(result).reduce((pre, item) => pre.includes(item) ? pre : [...pre, item], []) :
                    result.filter(item => !data.includes(item))

                this.compare()
            },
            // 单选
            singleSelect(val) {
                if (!this.isMult) {
                    this.checkedDatas = [val.FTAGID]
                    this.results = [{
                        firstId: this.firstSelect.FID,
                        firstName: this.firstSelect.FNAME,
                        secondId: this.secondSelect.FID,
                        secondName: this.secondSelect.FNAME,
                        tagId: val.FTAGID,
                        tagName: val.FNAME
                    }]
                }
            },
            // 复选
            handleCheckedCitiesChange(val) {
                this.checkAll = this.isCheckAll()
                this.compare()
            },
            isCheckAll() {
                return this.tagData.filter(item => this.checkedDatas.includes(item.FTAGID)).length === this.tagData.length
            },
            //  比较选中数据和结果数据
            compare() {
                // 筛选出当前二级分类和非当前二级分类下面选中的结果
                let results1 = this.results.filter(item => item.secondId !== this.secondSelect.FID)
                let results2 = this.results.filter(item => item.secondId === this.secondSelect.FID)
                // 合并checkDatas和当前二级分类下标签的id，取出不同项
                let resIds = results2.map(item => item.tagId)
                let diffs = this.checkedDatas.concat(resIds).filter((item, index, arr) => {
                    return arr.indexOf(item) === arr.lastIndexOf(item)
                })
                // 遍历不同项，如果存在于结果中，则删除，否则增加
                diffs.forEach(ele => {
                    let index = results2.findIndex(item => item.tagId === ele)
                    if (index > -1) {
                        results2.splice(index, 1)
                    } else {
                        let ind = this.tagData.findIndex(item => item.FTAGID === ele)
                        results2.push({
                            firstId: this.firstSelect.FID,
                            firstName: this.firstSelect.FNAME,
                            secondId: this.secondSelect.FID,
                            secondName: this.secondSelect.FNAME,
                            tagId: ele,
                            tagName: this.tagData[ind].FNAME
                        })
                    }
                })
                this.results = results1.concat(results2)
            },
            // 反向比较选中数据和结果数据
            compareReverse() {
                let results = this.results.filter(item => item.secondId === this.secondSelect.FID)
                this.checkedDatas = results.map(item => item.tagId)
                this.checkAll = this.isCheckAll()
            },
            getFirstCategory() {
                postAjax({
                    url: '/auto/weixin/sys/manager/tagTypeManage/queryTagTypeLocal',
                    data: {
                        FVALID: 1,
                        FLEVEL: 1,
                        TAG_NAME_SEARCH: this.searchVal
                    }
                }).then(res => {
                    let LETTERS = res.data.map(item => item.FLETTER).reduce((pre, item, index, arr) => pre.includes(item) ? pre : [...pre, item], []).sort()
                    let result = LETTERS.map(item => {
                        return {
                            LETTER: item,
                            nodes: []
                        }
                    })
                    res.data.forEach(item => {
                        let ind = result.findIndex(ele => ele.LETTER === item.FLETTER)
                        if (ind > -1 && !!item.FID) {
                            result[ind].nodes.push({
                                FID: item.FID,
                                FNAME: item.FNAME
                            })
                        }
                    })
                    console.log(result)
                    if (!!this.curPerciseFilterItem) {
                        let filterResult = []
                        result.forEach((ele, ind) => {
                            ele.nodes.forEach((item, index) => {
                                if (item.FID === this.curPerciseFilterItem.LEVEL_1_ID) {
                                    filterResult.push({
                                        LETTER: ele.LETTER,
                                        nodes: [item]
                                    })
                                }
                            })
                        })
                        this.firstCategory = filterResult

                    } else {
                        this.firstCategory = result
                    }
                    try {
                        this.firstSelect = this.firstCategory[0].nodes[0]
                    } catch {
                        this.secondCategory = []
                        this.tagData = []
                        this.total = 0
                    }
                })
            },
            getSecondCategory() {
                postAjax({
                    url: '/auto/weixin/sys/manager/tagTypeManage/queryTagTypeLocal',
                    data: {
                        FVALID: 1,
                        FLEVEL: 2,
                        FLEVEL_ONE_TYPEID: this.firstSelect.FID,
                        SQLKEY: 'BASE_SERIES_ALL_SELECT',
                        GROUP_USED_LEVELTWO_TAG_TYPE: true,
                        TAG_NAME_SEARCH: this.searchVal
                    }
                }).then(res => {
                    if (!!this.curPerciseFilterItem) {
                        let filterResult = res.data.filter(item => item.FID === this.curPerciseFilterItem.LEVEL_2_ID)
                        this.secondCategory = filterResult
                    } else {
                        this.secondCategory = res.data
                    }
                    if (this.secondCategory.length > 0) {
                        this.secondSelect = this.secondCategory[0]
                    } else {
                        this.tagData = []
                        this.total = 0
                    }
                })
            },
            getTags() {
                postAjax({
                    url: '/auto/weixin/sys/manager/accountgroup/getUserTagsList',
                    data: {
                        iDisplayStart: (this.curPage - 1) * this.pageSize,
                        iDisplayLength: this.pageSize,
                        KW_SEARCH: this.searchVal,
                        TAG_TYPE_ID: this.secondSelect.FID
                    }
                }).then(res => {
                    this.tagData = res.data
                    this.total = res.iTotalDisplayRecords
                    this.compareReverse()
                })
            },
            removeSelect(item) {
                let index = this.results.findIndex(ele => ele.tagId === item.tagId)
                this.results.splice(index, 1)
                this.compareReverse()
            },
            clearAll() {
                this.results = []
                this.compareReverse()
            },
            confirmEvent() {
                callback(this.results)
                this.dialogShow = false
            },
            pageChange(page) {
                this.curPage = page
                this.getTags()
            },
            // 清空搜索
            clearSearch() {
                this.curPerciseFilterItem = null
                this.searchVal = ''
                this.curPage = 1
                this.getFirstCategory()
            },
            // 精准搜索
            preciseSearch(item) {
                this.showSearchResults = false
                this.curPerciseFilterItem = item
                this.getFirstCategory()
            },
            toSearch() {
                this.curPerciseFilterItem = null
                this.curPage = 1
                this.getFirstCategory()
                this.showSearchResults = false
            }
        }
    }
    return brand_tpl
}

Vue.component('ym-select-tag', {
    template: `
    <div class="to-dialog" :class="{'noResult':results.length === 0}"  @click="toSelectDialog">
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
        category: Array,
        type: String,
        isMult: {
            type: Boolean,
            default: true
        }
    },
    mounted() {},
    computed: {
        showText() {
            if (this.results.length > 0) {
                let text = this.results.reduce((pre, cur) => {
                    if (pre !== '') pre += ';'
                    return pre + cur.firstName + '->' + cur.secondName + '->' + cur.tagName
                }, '')
                return text
            } else {
                return '请选择标签'
            }
        }
    },
    watch: {
        category: {
            handler(val) {
                if (Object.prototype.toString.call(val) === '[object Array]') {
                    this.results = val
                } else {
                    this.results = []
                }
            },
            immediate: true
        }
    },
    methods: {
        toSelectDialog() {
            if (!!this.dialogObj && !!this.dialogObj.obj) {
                this.dialogObj.obj.dialogShow = true
                this.dialogObj.obj.results = this.results
                this.dialogObj.obj.compareReverse()
            } else {
                this.dialogObj = openYMTagDialog(this.complete, this.isMult)
            }
        },
        complete(res) {
            this.results = res
            this.$emit('complete', res)
        }
    }
})

function openYMTagDialog(callback, isMult) {
    let tagDialog = {
        obj: null
    }
    // 生成弹窗的容器
    let id = generateDialogContainer();
    let tpl = generateYMTagTpl(callback)
    let judy = Vue.extend(tpl);
    tagDialog.obj = new judy({
        propsData: {
            isMult
        }
    }).$mount(`#${id}`);
    return tagDialog
}

