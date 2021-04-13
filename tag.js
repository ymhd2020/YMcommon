/*
 * @Author: ymhd 
 * @Date: 2020-11-30 17:21:38 
 * @Last Modified by: ymhd
 * @Describe: 标签选择弹窗
 * @Last Modified time: 2020-12-08 17:16:42
 */

//  选择标签（文字形态）
Vue.component('select-tag-two', {
    template: `
    <div class="connect-tag">
        <div class="click-btn" @click="toSelectDialog">点击选择标签</div>
        <el-tag
            v-for="tag in tagList"
            :key="tag.FTAGID"
            closable
            type="info"
            @close="handleClose(tag)"
            >
            {{tag.FNAME}}
        </el-tag>
    </div>
    `,
    data() {
        return {
            tagList: [],
            tagDialog3: null
        }
    },
    model: {
        prop: 'results',
        event: 'complete'
    },
    props: {
        results: Array
    },
    watch: {
        results(val) {
            this.tagList = val
        }
    },
    methods: {
        toSelectDialog() {
            if (!!this.tagDialog3 && !!this.tagDialog3.obj) {
                this.tagDialog3.obj.dialogShow = true
                this.tagDialog3.obj.results = this.tagList
                this.tagDialog3.obj.setSelectionCheck()
            } else {
                this.tagDialog3 = openThridTag(this.tagList, this.complete)
            }
        },
        handleClose(val) {
            let index = this.tagList.findIndex(a => a.FTAGID === val.FTAGID)
            this.tagList.splice(index, 1)
        },
        complete(res) {
            this.tagList = res
            this.$emit('complete', res)
        }
    }
})
// 选择标签（input框形态）
Vue.component('select-tag', {
    template: `
    <div class="to-dialog" :class="{'noResult':results.length === 0}"  @click="toSelectDialog">
        {{results.length>0 ? resultsStr:placeText}}
    </div>
    `,
    data() {
        return {
            results: [],
            resultsStr: '',
            tagDialog1: null,
            tagDialog2: null,
            tagDialog3: null,
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
        level: Number
    },
    watch: {
        category: {
            handler(val) {
                this.results = val
                this.resultsStr = val.map(item => item.FNAME).join('|')
            },
            immediate: true
        }
    },
    computed: {
        placeText() {
            let text
            switch (this.level) {
                case 1:
                    text = '点击选择一级分类'
                    break
                case 1:
                    text = '点击选择二级分类'
                    break
                default:
                    text = '点击选择标签'
                    break
            }
            return text
        }
    },
    methods: {
        toSelectDialog() {
            if (this.level === 1) {
                if (!!this.tagDialog1 && !!this.tagDialog1.obj) {
                    this.tagDialog1.obj.dialogShow = true
                    this.tagDialog1.obj.results = this.results
                    this.tagDialog1.obj.setSelectionCheck()
                } else {
                    this.tagDialog1 = openFirstTag(this.results, this.complete)
                }
            } else if (this.level === 2) {
                if (!!this.tagDialog2 && !!this.tagDialog2.obj) {
                    this.tagDialog2.obj.dialogShow = true
                    this.tagDialog2.obj.results = this.results
                    this.tagDialog2.obj.setSelectionCheck()
                } else {
                    this.tagDialog2 = openSecondTag(this.results, this.complete)
                }
            } else {
                if (!!this.tagDialog3 && !!this.tagDialog3.obj) {
                    this.tagDialog3.obj.dialogShow = true
                    this.tagDialog3.obj.results = this.results
                    this.tagDialog3.obj.setSelectionCheck()
                } else {
                    this.tagDialog3 = openThridTag(this.results, this.complete)
                }
            }
        },
        complete(res) {
            this.results = res
            this.resultsStr = res.map(item => item.FNAME).join('|')
            this.$emit('complete', res)
        }
    }
})
// 标记标签
Vue.component('edit-tag', {
    template: `
    <el-dialog :title="title"
        :visible.sync="dialogShow"
        :close-on-click-modal="false"
        >
        <div class="editTag-wrapper">
            <div class="single-group">
                <div class="tag-label">标签名称</div>
                <input-len-control v-model="newTagName"  placeholder="请输入标签名称"></input-len-control>
            </div>
            <div class="single-group">
                <div class="tag-label">二级分类</div>
                <select-tag v-model="newTagCategory" :level="2"></select-tag>
            </div>
        </div>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogShow=false">取 消</el-button>
                <el-button type="primary"  @click="confirm">确 定</el-button>
            </div>
        </el-dialog>
    `,
    data() {
        return {
            dialogShow: false,
            newTagCategory: [],
            newTagName: '',
            tagId: ''
        }
    },
    props: {
        controlTag: Number,
        title: String,
        tagInfo: {
            type: Object,
            default: () => {}
        }
    },
    watch: {
        controlTag(val) {
            if (val > 0) {
                this.dialogShow = true
            }
        },
        tagInfo(val) {
            if (Object.prototype.toString.call(val) === '[object Object]' && Reflect.has(val, 'FNAME')) {
                this.newTagName = val.FNAME
                this.tagId = val.FTAGID
                this.newTagCategory = val.categorys
            } else {
                this.newTagName = ''
                this.newTagCategory = []
                this.tagId = ''
            }
        }
    },
    methods: {
        confirm() {
            if (this.newTagName === "") {
                showDefaultTips('请输入标签名称', '', 3, 1000);
                return;
            }
            if (this.newTagCategory.length === 0) {
                showDefaultTips('请选择二级分类', '', 3, 1000);
                return;
            }
            let reg = /^[a-zA-Z0-9\u4e00-\u9fa5]+$/;
            if (!reg.test(this.newTagName)) {
                showDefaultTips('', '标签名称只能由中文、英文字母或数字组成', 3, 1000);
                return;
            }
            let data = {
                FNAME: this.newTagName,
                TAGTYPEID: this.newTagCategory.map(item => item.FID)
            };
            if (!!this.tagId) data['FTAGID'] = this.tagId
            postAjax({
                url: '/auto/weixin/sys/manager/accountgroup/addTag',
                data: data
            }).then(res => {
                if (!!this.tagId) {
                    showDefaultTips('编辑成功', '', 1, 1000);
                } else {
                    showDefaultTips('添加成功', '', 1, 1000);
                }
                this.dialogShow = false;
                setTimeout(() => {
                    this.$emit('complete', res)
                }, 800)
            }).catch(e => {})
        }
    }
})
// 删除标签
Vue.component('delete-tag', {
    template: `
    <el-dialog title="删除标签"
        :visible.sync="dialogShow"
        :close-on-click-modal="false"
        >
        删除该标签后，该标签下的所有用户将失去标签属性，是否确定删除？
        <div slot="footer" class="dialog-footer">
            <el-button @click="dialogShow=false">取 消</el-button>
            <el-button type="primary"  @click="confirm">确 定</el-button>
        </div>
    </el-dialog>
    `,
    data() {
        return {
            dialogShow: false,
        }
    },
    props: {
        controlTag: Number,
        tagId: String
    },
    watch: {
        controlTag(val) {
            if (val > 0) {
                this.dialogShow = true
            }
        }
    },
    methods: {
        confirm() {
            postAjax({
                url: '/auto/weixin/sys/manager/accountgroup/deleteUserTags',
                data: {
                    FTAGID: this.tagId
                }
            }).then(res => {
                showDefaultTips('删除成功', '', 1, 1000);
                this.dialogShow = false;
                setTimeout(() => {
                    this.$emit('complete')
                }, 800)
            })
        }
    }
})

// 标签弹窗(打标签优化版)
function openTagDialogOptimise(initData, callback) {
    let tagDialog = {
        obj: null
    }
    let next = function (data) {
        // slot的代替法
        let options = {
            data: {
                selectCategory: '-1',
                options: data,
                showAddDialog: false,
                newTagName: '',
                newTagLength: 0,
                newTagCategory: [],
                showSearchResults: false,
                searchResults: [],
                searchMethod: null,
                curPerciseFilterItem: {}
            },
            template: `
            <div class="tag-special-require">
                <input type="text" placeholder="请输入关键字" v-model="searchVal" style="width:280px;" @input="searchChange" @keyup.enter="toSearch">
                <div class="ym-search-btn iconfont" @click="toSearch">&#xe60f;</div>
                <div class="search-result-area" v-if="showSearchResults && searchResults.length > 0" style="width:260px;">
                    <ul>
                        <li v-for="item in searchResults" @click="preciseSearch(item)">{{item.LEVEL_1_NAME}} > {{item.LEVEL_2_NAME}} > <span>{{searchVal}}</span></li>
                    </ul>
                </div>
                <select @change="selectChange" v-model="selectCategory" style="width:140px;">
                    <option value="-1">全部</option>
                    <option  v-for="item in options" :value="item.FID">{{item.FNAME}}</option>
                </select>
                <el-button size="small" type="primary" @click="resetFilter">重置</el-button>
                <div style="position:relative;margin-left: 10px;">
                    标签不满足? <span class="color-blue" @click="addTagEvent">立即新增</span>
                    <div class="add-new-container" v-show="showAddDialog">
                        <div class="content">
                            <div class="tag-label">标签名称</div>
                            <div class="single-group">
                                <input-len-control v-model="newTagName"  placeholder="请输入标签名称"></input-len-control>
                            </div>
                            <div class="tag-label">二级分类</div>
                            <div class="single-group">
                                <select-tag v-model="newTagCategory" :level="2"></select-tag>
                            </div>
                        </div>
                        <div class="btns">
                            <el-button type="primary" size="small" @click="addNewTag">确 定</el-button>
                            <el-button size="small" @click="showAddDialog=false">取 消</el-button>
                        </div>
                    </div>
                </div>
            </div>
            `,
            mounted() {
            },
            methods: {// 初始化搜索节流
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
                // 重置
                resetFilter() {
                    this.selectCategory = '-1'
                    this.searchVal = ''
                    this.dataList = {}
                    this.pageChange(1)
                    
                },
                searchChange(e) {
                    return
                    if(!this.searchMethod) {
                        this.initSearchMethods()
                    }
                    if(this.searchVal !== '') {
                        this.searchMethod()
                        this.showSearchResults = true
                    }
                },
                preciseSearch(item) {
                    this.curPerciseFilterItem = item
                    this.showSearchResults = false
                    // this.selectCategory = '-1'
                    this.dataList = {}
                    this.pageChange(1)
                },
                toSearch() {
                    this.curPerciseFilterItem = {}
                    this.showSearchResults = false
                    this.dataList = {} // 清除缓存数据
                    this.pageChange(1)
                },
                getData() {
                    let data = {
                        iDisplayStart: (this.curPage - 1) * this.pageSize,
                        iDisplayLength: this.pageSize,
                        KW_SEARCH: this.searchVal,
                        TAG_TYPE_ID: this.selectCategory === '-1' ? '' : this.selectCategory,
                        SEARCH_FOR_DOTAG: true 
                    }
                    if(Reflect.has(this.curPerciseFilterItem, 'TAG_TYPE_ID')) {
                        data.TAG_TYPE_ID = this.curPerciseFilterItem.LEVEL_2_ID
                    }
                    postAjax({
                        url: '/auto/weixin/sys/manager/accountgroup/getUserTagsList',
                        data: data
                    }).then(res => {
                        if (res.success) {
                            this.dataList['page' + this.curPage] = res.data
                            this.tableData = res.data
                            this.pageNum = res.iTotalRecords
                            this.setSelectionCheck() // 复选，选中表格数据
                        }
                    })
                },
                selectChange(val) {
                    this.curPerciseFilterItem = {}
                    this.showSearchResults = false
                    // this.searchVal = ''
                    this.dataList = {} // 清除缓存数据
                    this.pageChange(1)
                },
                // 添加新标签
                addTagEvent() {
                    this.showAddDialog = !this.showAddDialog
                },
                addNewTag() {
                    if (this.newTagName === "") {
                        showDefaultTips('请输入标签名称', '', 3, 1000);
                        return;
                    }
                    if (this.newTagCategory.length === 0) {
                        showDefaultTips('请选择二级分类', '', 3, 1000);
                        return;
                    }
                    let reg = /^[a-zA-Z0-9\u4e00-\u9fa5]+$/;
                    if (!reg.test(this.newTagName)) {
                        showDefaultTips('', '标签名称只能由中文、英文字母或数字组成', 3, 1000);
                        return;
                    }
                    let data = {
                        FNAME: this.newTagName,
                        TAGTYPEID: this.newTagCategory.map(item => item.FID)
                    };
                    postAjax({
                        url: '/auto/weixin/sys/manager/accountgroup/addTag',
                        data: data
                    }).then(res => {
                        showDefaultTips('添加成功', '', 1, 1000);
                        this.showAddDialog = false;
                        this.dataList = {} // 清除缓存数据
                        this.pageChange(1)
                    })
                },
                complete(res) {
                    callback(res)
                }
            },
        };
        let props = {
            title: "选择标签",
            isSection: '2',
            colsData: [{
                key: 'FNAME',
                name: '标签'
            },{
                key: 'TAG_TYPE_NAME',
                name: '所属分类'
            }],
            keyword: 'FTAGID',
            initData: initData,
            hideClearBtn: true
        };
        // 生成弹窗的容器
        let id = generateDialogContainer();
        let tpl = generateDialogTemplate(options);
        let judy = Vue.extend(tpl);
        tagDialog.obj = new judy({
            propsData: props,
        }).$mount(`#${id}`);
    }
    // 获取二级标签列表
    postAjax({
        url: '/auto/weixin/sys/manager/tagTypeManage/queryTagTypeLocal',
        data: {
            FVALID: 1,
            FLEVEL: 2,
            GROUP_USED_LEVELTWO_TAG_TYPE: true
        }
    }).then(res => {
        if (res.success) {
            next(res.data)
        }
    })
    return tagDialog
}
// 标签弹窗
function openThridTag(initData, callback) {
    let tagDialog = {
        obj: null
    }
    let next = function (data) {
        // slot的代替法
        let options = {
            data: {
                selectCategory: '-1',
                options: data,
                showAddDialog: false,
                newTagName: '',
                newTagLength: 0,
                newTagCategory: []
            },
            template: `
            <select @change="selectChange" v-model="selectCategory">
                <option value="-1">所有二级分类</option>
                <option  v-for="item in options" :value="item.FID">{{item.FNAME}}</option>
            </select>
            <input type="text" placeholder="请输入关键字" v-model="searchVal">
            <div class="ym-search-btn iconfont" @click="toSearch">&#xe60f;</div>
            <div style="position:relative;">
                标签不满足? <span class="color-blue" @click="addTagEvent">立即新增</span>
                <div class="add-new-container" v-show="showAddDialog">
                    <div class="content">
                        <div class="tag-label">标签名称</div>
                        <div class="single-group">
                            <input-len-control v-model="newTagName"  placeholder="请输入标签名称"></input-len-control>
                        </div>
                        <div class="tag-label">二级分类</div>
                        <div class="single-group">
                            <select-tag v-model="newTagCategory" :level="2"></select-tag>
                        </div>
                    </div>
                    <div class="btns">
                        <el-button type="primary" size="small" @click="addNewTag">确 定</el-button>
                        <el-button size="small" @click="showAddDialog=false">取 消</el-button>
                    </div>
                </div>
            </div>
            `,
            methods: {
                getData() {
                    let data = {
                        iDisplayStart: (this.curPage - 1) * this.pageSize,
                        iDisplayLength: this.pageSize,
                        KW_SEARCH: this.searchVal,
                        TAG_TYPE_ID: this.selectCategory === '-1' ? '' : this.selectCategory
                    }
                    postAjax({
                        url: '/auto/weixin/sys/manager/accountgroup/getUserTagsList',
                        data: data
                    }).then(res => {
                        if (res.success) {
                            this.dataList['page' + this.curPage] = res.data
                            this.tableData = res.data
                            this.pageNum = res.iTotalRecords
                            this.setSelectionCheck() // 复选，选中表格数据
                        }
                    })
                },
                selectChange(val) {
                    this.searchVal = ''
                    this.dataList = {} // 清除缓存数据
                    this.pageChange(1)
                },
                // 添加新标签
                addTagEvent() {
                    this.showAddDialog = !this.showAddDialog
                },
                addNewTag() {
                    if (this.newTagName === "") {
                        showDefaultTips('请输入标签名称', '', 3, 1000);
                        return;
                    }
                    if (this.newTagCategory.length === 0) {
                        showDefaultTips('请选择二级分类', '', 3, 1000);
                        return;
                    }
                    let reg = /^[a-zA-Z0-9\u4e00-\u9fa5]+$/;
                    if (!reg.test(this.newTagName)) {
                        showDefaultTips('', '标签名称只能由中文、英文字母或数字组成', 3, 1000);
                        return;
                    }
                    let data = {
                        FNAME: this.newTagName,
                        TAGTYPEID: this.newTagCategory.map(item => item.FID)
                    };
                    postAjax({
                        url: '/auto/weixin/sys/manager/accountgroup/addTag',
                        data: data
                    }).then(res => {
                        showDefaultTips('添加成功', '', 1, 1000);
                        this.showAddDialog = false;
                        this.dataList = {} // 清除缓存数据
                        this.pageChange(1)
                    })
                },
                complete(res) {
                    callback(res)
                }
            },
        };
        let props = {
            title: "选择标签",
            isSection: '2',
            colsData: [{
                key: 'FNAME',
                name: '标签'
            }],
            keyword: 'FTAGID',
            initData: initData
        };
        // 生成弹窗的容器
        let id = generateDialogContainer();
        let tpl = generateDialogTemplate(options);
        let judy = Vue.extend(tpl);
        tagDialog.obj = new judy({
            propsData: props,
        }).$mount(`#${id}`);
    }
    // 获取二级标签列表
    postAjax({
        url: '/auto/weixin/sys/manager/tagTypeManage/queryTagTypeLocal',
        data: {
            FVALID: 1,
            FLEVEL: 2,
            GROUP_USED_LEVELTWO_TAG_TYPE: true
        }
    }).then(res => {
        if (res.success) {
            next(res.data)
        }
    })
    return tagDialog
}
//  二级分类弹窗
function openSecondTag(initData, callback) {
    let tagDialog = {
        obj: null
    }
    let next = function (data) {
        // slot的代替法
        let options = {
            data: {
                selectCategory: '-1',
                options: data,
                perfectDialog: null
            },
            template: `
            <select @change="selectChange" v-model="selectCategory">
                <option value="-1">所有一级分类</option>
                <option  v-for="item in options" :value="item.FID">{{item.FNAME}}</option>
            </select>
            <input type="text" placeholder="请输入关键字" v-model="searchVal">
            <div class="ym-search-btn iconfont" @click="toSearch">&#xe60f;</div>
            <div>
                分类不满足? <span class="color-blue" @click="completeTag">帮忙完善</span>
            </div>
            `,
            methods: {
                getData() {
                    let data = {
                        FVALID: 1,
                        FLEVEL: 2,
                        iDisplayStart: (this.curPage - 1) * this.pageSize,
                        iDisplayLength: this.pageSize,
                        FLEVEL_ONE_TYPEID: this.selectCategory === '-1' ? '' : this.selectCategory,
                        KW_SEARCH: this.searchVal,
                    }
                    postAjax({
                        url: '/auto/weixin/sys/manager/tagTypeManage/queryTagTypeLocal',
                        data: data
                    }).then(res => {
                        if (res.success) {
                            this.dataList['page' + this.curPage] = res.data
                            this.tableData = res.data
                            this.pageNum = res.iTotalRecords
                            this.setSelectionCheck() // 复选，选中表格数据
                        }
                    })
                },
                selectChange(val) {
                    this.searchVal = ''
                    this.dataList = {} // 清除缓存数据
                    this.pageChange(1)
                },
                completeTag() {
                    if (!!this.perfectDialog) {
                        this.perfectDialog.dialogShow = true
                    } else {
                        this.perfectDialog = perfectTag()
                    }
                },
                complete(res) {
                    callback(res)
                }
            },
        };
        let props = {
            title: "选择二级分类",
            isSection: '2',
            colsData: [{
                key: 'FNAME',
                name: '二级分类名称'
            }],
            keyword: 'FID',
            initData: initData
        };
        // 生成弹窗的容器
        let id = generateDialogContainer();
        let tpl = generateDialogTemplate(options);
        let judy = Vue.extend(tpl);
        tagDialog.obj = new judy({
            propsData: props,
        }).$mount(`#${id}`);
    }
    // 获取一级标签分类
    postAjax({
        url: '/auto/weixin/sys/manager/tagTypeManage/queryTagTypeLocal',
        data: {
            FVALID: 1,
            FLEVEL: 1
        }
    }).then(res => {
        if (res.success) {
            next(res.data)
        }
    })
    return tagDialog
}
// 一级分类弹窗
function openFirstTag(initData, callback) {
    let tagDialog = {
        obj: null
    }
    let options = {
        template: '',
        methods: {
            getData() {
                let data = {
                    FVALID: 1,
                    FLEVEL: 1,
                    KW_SEARCH: this.searchVal,
                    iDisplayStart: (this.curPage - 1) * this.pageSize,
                    iDisplayLength: this.pageSize,
                }
                postAjax({
                    url: '/auto/weixin/sys/manager/tagTypeManage/queryTagTypeLocal',
                    data: data
                }).then(res => {
                    if (res.success) {
                        this.dataList['page' + this.curPage] = res.data
                        this.tableData = res.data
                    }
                })
            },
            complete(res) {
                callback(res)
            }
        }
    };
    let props = {
        title: "选择一级分类",
        isSection: '1',
        colsData: [{
            key: 'FNAME',
            name: '一级分类名称'
        }],
        keyword: 'FID',
        showResult: false,
        initData: initData
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

// 完善标签弹窗
function perfectTag() {
    let tagDialog
    // 生成弹窗的容器
    let id = generateDialogContainer();
    let judy = Vue.extend({
        template: `
        <el-dialog title="分类申请"
        :visible.sync="dialogShow"
        :close-on-click-modal="false"
        >
        <div class="content diy-tags-content">
            <fieldset>
                <legend>申请规则：（填写时，必须严格遵守以下规则，否则<span class="color-red">不能通过审核</span>）</legend>
                <p>1、名称不带感情色彩，必须文明健康；</p>
                <p>2、为了保持行业通用性，不允许带有各自企业组织名称等关键词，以免影响通用性。</p>
            </fieldset>
            <div class="form-area">
                <div class="item-tabs">
                    <el-radio v-model="curTab" label="1">找到合适的一级分类但没有找到合适的二级分类</el-radio>
                    <el-radio v-model="curTab" label="2">没有找到合适的一级分类</el-radio>
                </div>
                <div class="group-item" v-show="curTab === '2'">
                    <div class="item-label">一级分类</div>
                    <div class="input-area">
                    <input-len-control v-model="firstCategory"  placeholder="请输入一级分类"></input-len-control>
                    </div>
                </div>
                <div class="group-item" v-show="curTab === '1'">
                    <div class="item-label">一级分类</div>
                    <select-tag v-model="newTagCategory" :level="1"></select-tag>
                </div>
                <div class="group-item">
                    <div class="item-label">二级分类</div>
                    <div class="input-area">
                    <input-len-control v-model="secondCategory"  placeholder="请输入二级分类"></input-len-control>
                    </div>
                </div>
            </div>
        </div>
        <div slot="footer" class="dialog-footer">
            <el-button @click="dialogShow=false">取 消</el-button>
            <el-button type="primary"  @click="confirm">确 定</el-button>
        </div>
        </el-dialog>
        `,
        data() {
            return {
                dialogShow: true,
                firstCategory: '',
                secondCategory: '',
                newTagCategory: [],
                curTab: '1'
            }
        },
        methods: {
            confirm() {
                if (!this.beformConfirm()) return;
                let data = {
                    APPLY_TYPE: "",
                    LEVEL_ONE_ID: "",
                    LEVEL_ONE_NAME: "",
                    LEVEL_TWO_NAME: ""
                }
                if (this.curTab === '1') {
                    data.APPLY_TYPE = "3";
                    data.LEVEL_ONE_ID = this.newTagCategory[0].FID;
                    data.LEVEL_ONE_NAME = this.newTagCategory[0].FNAME;
                    data.LEVEL_TWO_NAME = this.secondCategory;
                } else {
                    data.APPLY_TYPE = "1";
                    data.LEVEL_ONE_NAME = this.firstCategory;
                    data.LEVEL_TWO_NAME = this.secondCategory;
                }
                postAjax({
                    url: '/auto/weixin/sys/manager/tagTypeManage/submitTagTypeApply',
                    data: data,
                }).then(res => {
                    showDefaultTips("提交成功，请前往'分类审核'页查看", '', 1, 1000);
                    this.dialogShow = false;
                })
            },
            beformConfirm() {
                let reg = /^[a-zA-Z0-9\u4e00-\u9fa5]+$/;
                if (this.curTab === '1') {
                    if (this.newTagCategory.length === 0) {
                        showDefaultTips('请选择一级分类', '', 3, 1000);
                        return false;
                    }
                } else {
                    if (this.firstCategory === '') {
                        showDefaultTips('请输入一级分类', '', 3, 1000);
                        return false;
                    }
                    if (!reg.test(this.firstCategory)) {
                        showDefaultTips('', '分类名称只能由中文、英文字母或数字组成', 3, 1000);
                        return false;
                    }
                }
                if (this.secondCategory === '') {
                    showDefaultTips('请输入二级分类', '', 3, 1000);
                    return false;
                }
                if (!reg.test(this.secondCategory)) {
                    showDefaultTips('', '分类名称只能由中文、英文字母或数字组成', 3, 1000);
                    return false;
                }
                return true;
            }
        }
    });
    tagDialog = new judy().$mount(`#${id}`);
    return tagDialog
}
