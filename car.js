/*
 * @Author: ymhd 
 * @Date: 2020-12-01 09:45:22 
 * @Last Modified by: ymhd
 * @Describe: 车品牌车型三级联动弹窗
 * @Last Modified time: 2021-03-05 10:37:17
 */

function generateCarTpl(callback) {
    let brand_tpl = {
        template: `
        <el-dialog title="品牌车型"
            :visible.sync="dialogShow"
            :close-on-click-modal="false"
            custom-class=""
            append-to-body
            >
            <div class="dialog-container">
                <div class="left-area brand-left-area">
                    <div class="select-car-title">
                        <div style="width:200px;">品牌</div>
                        <div style="width:250px;">车系</div>
                        <div>车型</div>
                    </div>
                    <div class="select-car-container">
                        <div class="brand-container">
                            <ul>
                                <li v-for="par in brandData" class="par-node">
                                    <div class="letter-title">{{par.LETTER}}</div>
                                    <ul>
                                        <li v-for="item in par.nodes" :class="{'selected':item.ID === brandSelect.ID}" @click="selectBrand(item)">
                                            {{item.NAME}}
                                        </li>
                                    </ul>
                                </li>
                            </ul>
                        </div>
                        <div class="series-container">
                            <ul>
                                <li v-for="item in seriesData" :class="{'selected':item.ID === seriesSelect.ID}"  @click="selectSeries(item)">
                                    {{item.NAME}}
                                </li>
                            </ul>
                        </div>
                        <div class="carData-container">
                            <template v-if="isMult">
                                <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">全选</el-checkbox>
                            </template>
                            <el-checkbox-group 
                            v-model="checkedCars" 
                            @change="handleCheckedCitiesChange" 
                            >
                                <el-checkbox @change="singleSelect(item)" v-for="item in carData" :label="item.ID" :key="item.ID" :title="item.NAME">{{item.NAME}}</el-checkbox>
                            </el-checkbox-group>
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
                        :key="item.carId"
                        v-for="(item,index) in results"
                        closable
                        :disable-transitions="false"
                        @close="removeSelect(item)">
                        {{item.brandName}}->{{item.seriesName}}->{{item.carName}}
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
                brandData: [],
                brandSelect: {},
                seriesData: [],
                seriesSelect: {},
                carData: [],
                results: [],
                checkAll: false,
                isIndeterminate: false,
                checkedCars: [],
                token: '',
                dialogShow: true
            }
        },
        created() {
            const {
                companyid,
                token
            } = getStorage()
            this.token = token
            this.getBrand()
        },
        props: {
            isMult: Boolean
        },
        watch: {
            brandSelect: {
                handler(val) {
                    this.getSeries()
                },
                immediate: false
            },
            seriesSelect: {
                handler(val) {
                    this.getCars()
                    this.checkAll = false
                    this.checkedCars = []
                },
                immediate: false
            }
        },
        mounted() {},
        methods: {
            selectBrand(item) {
                this.brandSelect = item
            },
            selectSeries(item) {
                this.seriesSelect = item
            },
            // 全选
            handleCheckAllChange(val) {
                if (!!val) {
                    this.checkedCars = this.carData.map(item => item.ID)
                } else {
                    this.checkedCars = []
                }
                this.compare()
            },
            singleSelect(val) {
                if (!this.isMult) {
                    this.checkedCars = [val.ID]
                    this.results = [{
                        brandId: this.brandSelect.ID,
                        brandName: this.brandSelect.NAME,
                        seriesId: this.seriesSelect.ID,
                        seriesName: this.seriesSelect.NAME,
                        carId: val.ID,
                        carName: val.NAME
                    }]
                }
            },
            // 复选
            handleCheckedCitiesChange(val) {
                this.checkAll = this.checkedCars.length === this.carData.length
                this.compare()
            },
            //  比较选中数据和结果数据
            compare() {
                // 筛选出当前车系和非当前车系下面选中的结果
                let results1 = this.results.filter(item => item.seriesId !== this.seriesSelect.ID)
                let results2 = this.results.filter(item => item.seriesId === this.seriesSelect.ID)


                let resIds = results2.map(item => item.carId)
                let diffs = this.checkedCars.concat(resIds).filter((item, index, arr) => {
                    return arr.indexOf(item) === arr.lastIndexOf(item)
                })
                diffs.forEach(ele => {
                    let index = results2.findIndex(item => item.carId === ele)
                    if (index > -1) {
                        results2.splice(index, 1)
                    } else {
                        let ind = this.carData.findIndex(item => item.ID === ele)
                        results2.push({
                            brandId: this.brandSelect.ID,
                            brandName: this.brandSelect.NAME,
                            seriesId: this.seriesSelect.ID,
                            seriesName: this.seriesSelect.NAME,
                            carId: ele,
                            carName: this.carData[ind].NAME
                        })
                    }
                })
                this.results = results1.concat(results2)
            },
            // 反向比较选中数据和结果数据
            compareReverse() {
                let results = this.results.filter(item => item.seriesId === this.seriesSelect.ID)
                this.checkedCars = results.map(item => item.carId)
                this.checkAll = this.checkedCars.length === this.carData.length
            },
            getBrand() {
                promiseAjax({
                    url: '/auto/weixin/noperm/manager/basedata/getletterbrand',
                    data: {
                        ACCESS_SESSION_TOKEN: this.token
                    }
                }).then(res => {
                    let result = []
                    res.letters.forEach(item => {
                        result.push({
                            LETTER: item.LETTER,
                            nodes: []
                        })
                    })
                    res.brands.forEach(item => {
                        let ind = result.findIndex(ele => ele.LETTER === item.LETTER)
                        if (ind > -1 && !!item.ID) {
                            result[ind].nodes.push({
                                ID: item.ID,
                                NAME: item.NAME
                            })
                        }
                    })
                    this.brandData = result
                    this.brandSelect = this.brandData[0].nodes[0]
                })
            },
            getSeries() {
                promiseAjax({
                    url: '/auto/weixin/noperm/manager/basedata/getselect',
                    data: {
                        ACCESS_SESSION_TOKEN: this.token,
                        BRANDID: this.brandSelect.ID,
                        SQLKEY: 'BASE_SERIES_ALL_SELECT'
                    }
                }).then(res => {
                    this.seriesData = res.data
                    this.seriesSelect = this.seriesData[0]
                })
            },
            getCars() {
                promiseAjax({
                    url: '/auto/weixin/noperm/manager/basedata/getselect',
                    data: {
                        ACCESS_SESSION_TOKEN: this.token,
                        SERIESID: this.seriesSelect.ID,
                        SQLKEY: 'BASE_MODEL_ALL_SELECT'
                    }
                }).then(res => {
                    this.carData = res.data
                    this.compareReverse()
                })
            },
            removeSelect(item) {
                let index = this.results.findIndex(ele => ele.carId === item.carId)
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
            }
        }
    }
    return brand_tpl
}

function selectBrand(initData,callback,url) {
    let brandDialog = {
        obj: null
    }
    let options = {
        template: '',
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
                postAjax({
                    url,
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
            complete(res) {
                callback(res)
            }
        }
    };
    let props = {
        title: "选择品牌列表",
        isSection: '2',
        colsData: [{
            key: 'FNAME',
            name: '品牌名称'
        },{
            key: 'FNUMBER',
            name: '编码'
        }],
        keyword: 'FID',
        showResult: true,
        initData: initData
    };
    // 生成弹窗的容器
    let id = generateDialogContainer();
    let tpl = generateDialogTemplate(options);
    let judy = Vue.extend(tpl);
    brandDialog.obj = new judy({
        propsData: props,
    }).$mount(`#${id}`);
    return brandDialog
}

// 选择车系
Vue.component('ym-select-car', {
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
                    return pre + cur.brandName + '->' + cur.seriesName + '->' + cur.carName
                }, '')
                return text
            } else {
                return '请选择车型'
            }
        }
    },
    watch: {
        category: {
            handler(val) {
                this.results = val
            },
            immediate: true
        }
    },
    methods: {
        toSelectDialog() {
            if (!!this.dialogObj && !!this.dialogObj.obj) {
                this.dialogObj.obj.dialogShow = true
            } else {
                this.dialogObj = openRadioDialog(this.complete, this.isMult)
            }
        },
        complete(res) {
            this.results = res
            this.$emit('complete', res)
        }
    }
})

function openRadioDialog(callback, isMult) {
    let tagDialog = {
        obj: null
    }
    // 生成弹窗的容器
    let id = generateDialogContainer();
    let tpl = generateCarTpl(callback)
    let judy = Vue.extend(tpl);
    tagDialog.obj = new judy({
        propsData: {
            isMult: isMult
        }
    }).$mount(`#${id}`);
    return tagDialog
}