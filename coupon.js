/*
 * @Author: ymhd 
 * @Date: 2020-11-30 17:24:03 
 * @Last Modified by: ymhd
 * @Describe: 优惠券弹窗
 * @Last Modified time: 2021-01-26 15:29:13
 */
// 优惠券
function openCoupon(initData, callback) {
    let tagDialog = {
        obj: null
    }
    let options = {
        template: `
        <template v-if="showSendDepart && sendType">
            发放部门： 
            <el-select v-model="sendCompany" placeholder="请选择公司">
                <el-option
                v-for="item in sendCompanyData"
                :key="item.ID"
                :label="item.NAME"
                :value="item.ID">
                </el-option>
            </el-select>
            <el-select v-model="sendDepartment" placeholder="请选择部门" style="margin-right: 20px;">
                <el-option
                v-for="item in sendDepartmentData"
                :key="item.FWXID"
                :label="item.FNAME"
                :value="item.FWXID">
                </el-option>
            </el-select>
        </template>
        <input type="text" placeholder="请输入关键字" v-model="searchVal">
        <div class="ym-search-btn iconfont" @click="toSearch">&#xe60f;</div>
        `,
        data: {
            sendCompany: '',
            sendCompanyData: [],
            sendDepartment: '',
            sendDepartmentData: [],
            showSendDepart: window.sessionStorage.getItem('groupType') === '1',
            sendType: false
        },
        watch: {
            sendCompany(val) {
                this.sendDepartment = ''
                if(val === '') {
                    this.sendDepartmentData = []
                }else {
                    this.getDepartment()
                }
            }
        },
        methods: {
            checkSendType() {
                postAjax({
                    url: `/auto/weixin/sys/manager/coupon/checkSendApply`,
                    data: {}
                }).then(res => {
                    if(res.NEEDAPPLY) {
                        this.sendType = true
                        this.getCompany()
                    }
                })
            },
            getDepartment() {
                postAjax({
                    url: `/auto/weixin/sys/manager/company/getdepartment`,
                    data: {
                        iDisplayStart: 0,
                        iDisplayIndex: 1000,
                        COMPANYID: this.sendCompany
                    }
                }).then(res => {
                    this.sendDepartmentData = res.data
                })
            },
            getCompany() {
                postAjax({
                    url: `/auto/weixin/sys/manager/company/get`,
                    data: {
                        iDisplayStart: 0,
                        iDisplayIndex: 1000
                    }
                }).then(res => {
                    this.sendCompanyData = res.data
                })
            },
            getData() {
                if (this.showSendDepart) {
                    this.checkSendType()
                }
                let data = {
                    FREPAIRPKG_TYPE: '',
                    SEARCHVALUE: this.searchVal,
                    KEYWORD_SEARCH: this.searchVal,
                    iDisplayStart: (this.curPage - 1) * this.pageSize,
                    iDisplayLength: this.pageSize
                }
                postAjax({
                    url: '/auto/weixin/sys/manager/coupon/getCouponList?FSTATUS=1&F7SELECT=1&',
                    data: data
                }).then(res => {
                    if (res.success) {
                        let data = res.data.map(item => {
                            item.input = 1
                            return item
                        })
                        this.dataList['page' + this.curPage] = data
                        this.tableData = data
                        this.pageNum = res.iTotalDisplayRecords
                    }
                })
            },
            complete(res) {
                let result = res.result
                result.forEach(element => {
                    element.DEPARTMENTID = this.sendDepartment
                    element.APPLYREMARK = res.remark
                });
                callback(result)
            },
            tableInputBlur(e, scope) {
                let index = scope.$index,
                    row = scope.row
                let val = e.target.value
                if (!(/(^[1-9]\d*$)/.test(val)) || val < 1) {
                    this.$message.error('优惠券数量必须为正整数')
                    this.tableData[index].input = 1
                    return
                }
                if (val > +row.FQTY) {
                    this.$message.error('优惠券数量不能大于库存')
                    this.tableData[index].input = +row.FQTY
                    return
                }
                this.tableData[index].input = val
            },
            getTagContent(item) {
                return item.input + '*' + item.FNAME
            }
        }
    };
    let props = {
        title: "选择优惠券列表",
        isSection: '2',
        dontTriggerSelect: true,
        colsData: [{
            key: 'FNAME',
            name: '优惠券名称',
        }, {
            key: 'COMPANY_NAME',
            name: '所属门店',
        }, {
            key: '',
            name: '发放数量',
            type: 'input'
        }, {
            key: 'TYPENAME',
            name: '类型',
        }, {
            key: 'FVALUE',
            name: '面额',
        }, {
            key: 'FQTY',
            name: '库存',
        }],
        keyword: 'FID',
        showResult: true,
        initData: initData,
        showRemarks: true
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