import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import {SmxActiveModal} from '../../../smx-component/smx-modal/smx-modal.module';
import {SmxModal} from '../../../smx-component/smx-modal/smx-modal.module';
import {TablegridComponent} from '../table-grid/tablegrid.component';
import {SmxDragModalComponent} from '../../../smx-component/smx-modal/smx-drag-modal/smx-drag-modal.component';
@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit {
  @Input() data: any;
  @Input() type: any;
  @Input() title: any;
  @Input() interface_id: any;
  @Input() isEdit: any;
  @Input() selectData: any;
  @Input() addres_updata: any;
  @Input() radio: any; // 添加门址数据
  @Input() addresGat: any; // 给地址详情传递地址id
  @Output() pointMarkObj = new EventEmitter();
  queryAddrsOutput: any;
  queryEndData: any;
  pointObj: any;
  // queryCriteria: any; // 根据查询条件查询后，结果分页，触发滚动加载的时候，用这个查询条件和分页条件一起查询
  constructor(public activeModal: SmxActiveModal, private ngbModalService: SmxModal) { }
  @ViewChild(TablegridComponent, {static: false}) TablegridComp: TablegridComponent;
  @ViewChild(SmxDragModalComponent, {static: false}) SmxDragModalComp: SmxDragModalComponent;
  ngOnInit() {
  }
  // 接收 下拉框的传过来的参数
  change(event: any) {
    this.queryEndData = event;
    this.TablegridComp.initData(event.data);
    this.TablegridComp.updateIdArray = [];
    this.TablegridComp.removeIdArray = [];
    this.TablegridComp.updateBtnStatus();
  }
  // third() {
  //   const modal = this.ngbModalService.open(ModalComponent, {centered: true, backdrop: 'static'});
  //   modal.componentInstance.data = {name: '123'};
  //   modal.componentInstance.type = 3;
  // }

  getObj(e: any) {
    this.pointObj = e;
    this.pointMarkObj.emit(this.pointObj);
  }
  minWindow(e: any) {
    this.SmxDragModalComp.toggleMinimize(e);
  }



}
