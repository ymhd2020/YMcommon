/*
 * @Author: ymhd 
 * @Date: 2020-12-14 10:14:39 
 * @Last Modified by: ymhd
 * @Describe: 普通弹窗组件（新增+编辑）
 * @Last Modified time: 2021-02-23 19:37:51
 */

Vue.component('ym-common-dialog', {
    template: `
        <el-dialog :title="title" :visible.sync="dialogShow" :close-on-click-modal="false">
			<div class="ym-common-dialog" :class="customClass">
				<div v-for="(col,index) in cols">
                    <span><em v-if="!!col.isRequire">*</em>{{col.name}}</span>
                    <template v-if="col.type === 'text'">
					    <div>{{submitData[col.key]}}</div>
                    </template>
                    <template v-if="col.type === 'input'">
					    <input type="text" v-model="submitData[col.key]" :placeholder="'请输入' + col.name">
                    </template>
                    <template v-if="col.type === 'radio'">
                        <div class="flexX">
                        <el-radio v-for="radio in col.data" v-model="submitData[col.key]" :label="radio.label">{{radio.name}}</el-radio>
                        </div>
                    </template>
                    <template v-if="col.type === 'select'">
                        <el-select v-model="submitData[col.key]" placeholder="请选择">
                            <el-option
                            v-for="option in col.data"
                            :key="option.value"
                            :label="option.label"
                            :value="option.value">
                            </el-option>
                        </el-select>
                    </template>
				</div>
			</div>
			<span slot="footer" class="dialog-footer">
				<el-button @click="dialogShow = false">取 消</el-button>
				<el-button type="primary" @click="confirm">确 定</el-button>
			</span>
		</el-dialog>
     `,
    data() {
        return {
            submitData: {}, // 提交数据集合
            dialogShow: false
        }
    },
    props: {
        //  弹窗显示/隐藏
        dialogVisible: {
            type: Number,
            default: 0
        },
        // 弹窗Title
        title: String,
        // 自定义样式
        customClass: String,
        // 数据列
        cols: {
            type: Array,
            default: () => []
        },
        // 实例数据
        // cols: [{
        //     name: '输入框',
        //     key: 'ccc',
        //     type: 'input',
        //     isRequire: true
        // }, {
        //     name: '单选框',
        //     key: 'aaa',
        //     type: 'radio',
        //     data: [{
        //         label: '1',
        //         name: '长城'
        //     }, {
        //         label: '2',
        //         name: '长安'
        //     }],
        //     isRequire: true
        // }, {
        //     name: '下拉框',
        //     key: 'bbb',
        //     type: 'select',
        //     data: [{
        //         value: '选项1',
        //         label: '黄金糕'
        //     }, {
        //         value: '选项2',
        //         label: '双皮奶'
        //     }],
        //     isRequire: true
        // }],
        // 渲染数据
        data: {
            type: Object,
            default: () => {}
        }
    },
    watch: {
        dialogVisible(val) {
            if (val > 0) {
                this.dialogShow = true
            }
        },
        data: {
            handler(val) {
                this.submitData = val
            },
            immediate: true
        },
        submitData: {
            // 应对 切换单选框隐藏其他元素的问题
            handler() {
                this.$emit('change', this.submitData)
            },
            deep: true
        }
    },
    methods: {
        confirm() {
            let isMust = this.cols.filter(item => item.isRequire).map(item => item.key)
            Object.keys(this.submitData).forEach(key => {
                let index = isMust.indexOf(key)
                if ((index > -1) && this.submitData[key] !== '' && !!this.submitData[key]) {
                    isMust.splice(index, 1)
                }
            })
            if (isMust.length > 0) {
                showDefaultTips('请注意必填项!', '', 3)
                return
            }
            this.$emit('complete', this.submitData)
            this.dialogShow = false
        }
    }
})