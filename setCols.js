/*
 * @Author: ymhd 
 * @Date: 2021-01-05 11:01:15 
 * @Last Modified by: ymhd
 * @Describe: 表格设置显示列组件
 * @Last Modified time: 2021-01-06 15:19:14
 */

 Vue.component('ym-set-cols',{
     template: `
     <el-popover
        placement="bottom"
        width="200"
        trigger="click">
        <div class="cols-flex">
            <div v-for="item in tableCols">
                <el-checkbox v-model="item.isCheck" :label="item.name" @change="checkChange"></el-checkbox>
            </div>
            <span class="show-all" @click="showAll(0)">不显示列</span>
            <span class="show-all r0" @click="showAll(1)">显示所有列</span>
        </div>
        <div class="set-cols" slot="reference">设置显示列</div>
    </el-popover>
     `,
     data() {
        return {
            tableCols: [],
            checkList: []
        }
     },
     model: {
        prop: 'cols',
        event: 'complete'
     },
     props: {
        cols: Array
     },
     mounted() {
        this.tableCols = this.cols.map(item=>item)
     },
     methods: {
        checkChange(item) {
            this.$emit('complete',this.tableCols)
        },
        showAll(tag) {
            this.tableCols.forEach(element => {
                element.isCheck = !!tag
            });
            this.$emit('complete',this.tableCols)
        }
     }
 })