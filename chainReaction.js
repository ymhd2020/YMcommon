/*
 * @Author: ymhd 
 * @Date: 2021-02-07 09:57:29 
 * @Last Modified by: ymhd
 * @Describe: N级联动弹窗
 * @Last Modified time: 2021-02-22 10:18:30
 */

/** 
 * initData: 默认选中数据
 * callback: 选中后的回调
 * argus: 格式如下
 *  **/
// let args = {
//     title: '弹窗名称',
//     searchUrl: '搜索接口url',
//     searchKey: '搜索关键字',
//     cols: [
//         // 联动第一级
//         {
//             list: [], // 如果存在list，组件则不发生请求，因为牵扯到字母排序，所以从外部传入,
//             idKey: 'id', // 该级的核心id
//             nameKey: 'name', // 该级的核心name
//         },
//         // 联动第二级
//         {
//             width: '200px', // 该级的宽度，不指定默认flex:1
//             url: '请求接口url',
//             data: {}, // 请求参数,不包括分页
//             originKey: 'brand_id',  // 请求该级数据时必传字段
//             originKeyFrom: 'id', // 必传字段对应上一级的字段
//             idKey: 'id', // 该级的核心id
//             nameKey: 'name', // 该级的核心name
//             openPage: false, // 是否开启分页
//         }
//     ]
// }

function openChainDialog(initData, callback, argus) {
    console.log(argus)
    let tpl = {
        template: `
        <el-dialog :title="argus.title"
            :visible.sync="dialogShow"
            :close-on-click-modal="false"
            :custom-class="argus.customClass"
            append-to-body
            >
            <div class="dialog-container">
                <div class="left-area">
                    <div class="section">
                        <template v-if="!!argus.searchKey">
                            <input type="text" placeholder="请输入关键字" v-model="searchVal"><div class="ym-search-btn iconfont" @click="toSearch">&#xe60f;</div>
                        </template>
                    </div>
                    <div class="chain-reaction-container">
                        <div class="chain-reaction-item" 
                        v-for="(col,index) in argus.cols" 
                        :style="{'width': col.width || 'auto'}" 
                        v-infinite-scroll="loadMore(col,index)"
                        infinite-scroll-disabled="!col.openPage">
                            <ul v-if="!!col.list">
                                <li v-for="par in col.list" class="par-node">
                                    <div class="letter-title">{{par.LETTER}}</div>
                                    <ul>
                                        <li v-for="item in par.nodes" @click="checkItem(index, item)" 
                                        :class="{'selected':!!hasSelect[index] && (item[col.idKey] === hasSelect[index][col.idKey])}">
                                            {{item[col.nameKey]}}
                                        </li>
                                    </ul>
                                </li>
                            </ul>
                            <div v-else-if="index === len - 1" class="chain-check-item">
                                <el-checkbox v-if="!isSingle" :indeterminate="indeterminate" v-model="checkAll" @change="handleCheckAllChange(col.idKey)">全选</el-checkbox>
                                <el-checkbox-group 
                                v-model="checkedDatas" 
                                @change="handleCheckedCitiesChange" 
                                >
                                    <el-checkbox
                                    v-for="item in dataSets[index]" :label="item[col.idKey]" :key="item[col.idKey]" :title="item[col.nameKey]">
                                        {{item[col.nameKey]}}
                                    </el-checkbox>
                                </el-checkbox-group>
                            </div>
                            <ul v-else class="common-list">
                                <li v-for="item,curIndex in dataSets[index]"  @click="checkItem(index, item)" 
                                :class="{'selected':!!hasSelect[index] && (item[col.idKey] === hasSelect[index][col.idKey])}" >
                                    {{item[col.nameKey]}}
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div class="right-area">
                    <div class="option">
                        当前选择（<span class="color-blue">{{results.length}}</span>）
                        <span class="color-blue" style="margin-left: 10px;cursor: pointer;" @click="clearAll">清空</span>
                    </div>
                    <div class="result">
                        <el-tag
                          :key="tag.id"
                          v-for="(tag,index) in results"
                          closable
                          :disable-transitions="false"
                          @close="removeTag(tag,index)">
                          {{tag.name}}
                        </el-tag>
                    </div>
                </div>
            </div>
            <div slot="footer" class="dialog-footer">
                <el-button @click="clearAll">清 空</el-button>
                <el-button @click="dialogShow = false">取 消</el-button>
                <el-button type="primary" @click="confirmEvent">确 定</el-button>
            </div>
        </el-dialog>
        `,
        data() {
            return {
                isSingle: argus.isSingle, // 单选
                searchVal: '',
                results: initData, // 选中结果
                dialogShow: true,
                Vuex: $Vuex,
                argus: argus,
                len: argus.cols.length, // 分级总数
                dataSets: new Array(argus.cols.length).fill('').map(() => []), // 数据集合
                dataPages: new Array(argus.cols.length).fill('').map(() => {
                    return {
                        curPage: 1,
                        pageSize: 10,
                        pageNum: 1
                    }
                }), // 分页
                hasSelect: [], // 当前选中的分级，但不包含最后一级
                checkAll: false, // 是否全选
                indeterminate: false,
                checkedDatas: [],// 选中的数据

                
            }
        },
        watch: {
            hasSelect: {
                handler(val) {
                    this.loadNextCategory(val.length)
                },
                deep: true
            }
        },
        mounted() {
            let firstList = this.argus.cols[0].list || []
            // 是否传入了第一级数据，如果没有则去根据传入的url请求数据
            if (firstList.length > 0) {
                this.dataSets[0] = firstList
                // 默认选中第一级的第一条数据，然后触发watch
                if (!!firstList[0].LETTER) {
                    this.checkItem(0, firstList[0].nodes[0])
                } else {
                    this.checkItem(0, firstList[0])
                }
            } else {
                this.loadNextCategory(0)
            }
        },
        methods: {
            getIdKey(index) {
                return this.argus.cols[this.len - 1]['idKey']
            },
            getNameKey(index) {
                return this.argus.cols[this.len - 1]['nameKey']
            },
            getParentId(index) {
                let id = this.getIdKey(index)
                return this.hasSelect[this.len - 2][id]
            },
            // 全选
            handleCheckAllChange(idKey) {
                this.checkedDatas = this.checkAll ? this.dataSets[this.len - 1].map(item=>item[idKey]) : []
                this.selectToResult()
            },
            // 选中数据发生变化
            handleCheckedCitiesChange() {
                if(this.isSingle && this.checkedDatas.length === 2) {
                    this.checkedDatas.splice(0,1)
                }
                this.selectToResult()
                this.checkAll = this.isCheckAll()
            },
            // 选中到结果同步
            selectToResult() {
                // 筛选出当前选中级别和非选中二级分类下面选中的结果
                let parentId = this.getParentId(this.len - 2)
                let results1 = this.results.filter(item => item.parentId !== parentId)
                let results2 = this.results.filter(item => item.parentId === parentId)
                let ids = results2.map(item=>item.id)
                // 取出当前选中与results中的不同项
                let diffs = this.checkedDatas.concat(ids).filter((item, index, arr) => {
                    return arr.indexOf(item) === arr.lastIndexOf(item)
                })
                // 遍历不同项，如果存在于结果中，则删除，否则增加
                diffs.forEach(ele => {
                    let index = results2.findIndex(item => item.id === ele)
                    if(index > -1) {
                        results2.splice(index, 1)
                    }else {
                        let idKey = this.getIdKey(this.len - 1),
                        nameKey = this.getNameKey(this.len - 1)
                        // 获取当前选中在整个数据中的索引
                        let index2 = this.dataSets[this.len - 1].findIndex(item=>item[idKey] === ele)
                        let obj = this.dataSets[this.len - 1][index2]
                        Object.assign(obj,{
                            name: obj[nameKey],
                            id: obj[idKey],
                            parentId: parentId
                        })
                        results2.push(obj)
                    }
                })
                this.results = results1.concat(results2)
            },
            // 反向同步
            resultsToSelect() {
                // 筛选出当前选中级别和非选中二级分类下面选中的结果
                let parentId = this.getParentId(this.len - 2)
                let results = this.results.filter(item => item.parentId === parentId)
                this.checkedDatas = results.map(item => item.id)
                this.checkAll = this.isCheckAll()
            },
            isCheckAll() {
                let parentId = this.getParentId(this.len - 2)
                return this.results.filter(item=>item.parentId === parentId).length === this.dataSets[this.len - 1].length
            },
            // 选中分级
            /***
             * level: 大级别
             * item: 当前选中数据
             */
            checkItem(level, item) {
                // 重置下一级的渲染数据
                this.$set(this.dataSets,  level + 1, [])
                // 重置当前级的选中数据
                this.$set(this.hasSelect, level, item)
            },
            // 加载下一级数据
            loadNextCategory(index) {
                // 如果第一级数据为空，则先请求第一级数据
                let curCol = this.argus.cols[index] // 当前请求级别的配置
                if (index < this.len) {
                    // 如果开启了分页，则添加分页参数
                    let data = curCol.openPage ? {
                        iDisplayStart: (this.dataPages[index].curPage - 1) * this.dataPages[index].pageSize,
                        iDisplayLength: this.dataPages[index].pageSize
                    } : {}
                    // 如果存在上一级，当当前请求需要携带上一级选中的id
                    if (!!this.hasSelect[index - 1]) {
                        data[curCol['originKey']] = this.hasSelect[index - 1][curCol['originKeyFrom']]
                    }
                    Object.assign(data, curCol.data)
                    postAjax({
                        url: curCol.url,
                        data: data
                    }).then(res => {
                        if (res.success) {
                            let temp = this.dataSets[index]
                            temp = temp.concat(res[curCol['resKey']])
                            this.$set(this.dataSets, index, temp)
                            this.dataPages[index].curPage += 1
                            this.dataPages[index].pageNum = res.iTotalRecords
                            if(index < this.len - 1) { // 如果还有下一级
                                this.$set(this.hasSelect,index,res[curCol['resKey']][0])
                            }else { // 如果是最后一级，反向选中
                                this.resultsToSelect()
                            }
                        }
                    })
                }
            },
            loadMore() {
                // 后面再写
            },
            //  清空
            clearAll() {
                this.results = []
                this.resultsToSelect()
            },
            removeTag(item, index) {
                this.results.splice(index, 1)
                let _i = this.checkedDatas.indexOf(item.id)
                if(_i > -1) {
                    this.checkedDatas.splice(_i, 1)
                }
            },
            confirmEvent() {
                callback(this.results)
                this.dialogShow = false
            },
            toSearch() {
                // 后面在写
            },
        }
    }
    let dialog = {}
    // 生成弹窗的容器
    let id = generateDialogContainer();
    let judy = Vue.extend(tpl);
    dialog.obj = new judy().$mount(`#${id}`);
    return dialog
}