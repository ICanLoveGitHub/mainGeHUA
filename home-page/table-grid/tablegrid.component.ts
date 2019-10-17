import { Component, OnInit , Input, Output, EventEmitter } from '@angular/core';
import {SmxModal} from '../../../smx-component/smx-modal/smx-modal.module';
import {ModalComponent} from '../modal/modal.component';
import {AppService} from '../../../s-service/app.service';
import {HttpService} from '../../../s-service/http.service';
// import {Utils} from '../../../s-service/utils';
import {toError} from 'src/app/smx-component/smx.module';
import { deepCopy, dateFormat } from 'src/app/smx-component/smx-util';
import {ToastConfig, ToastType, ToastService} from '../../../smx-unit/smx-unit.module';
import * as smartmapx from '@smx/api';
@Component({
  selector: 'app-tablegrid',
  templateUrl: './tablegrid.component.html',
  styleUrls: ['./tablegrid.component.scss']
})
export class TablegridComponent implements OnInit {

  @Input() Headerdata: any; // 表头名对象
  @Input() interface_id: any; // 删除数据需要的id字段英文名
  @Input() selectData: any; // 下拉框数据源
  @Input() queryEndData: any; // 点击查询之后的数据
  @Input() mapObj: any;
  @Output() markPointObj = new EventEmitter();
  @Output() minWindow = new EventEmitter();
  isAllChecked = false; // 全选
  dataIndex = ['a', 'b'];
  gridHeader: any = [];
  gridData = [];
  gridDataLength: any;
  nowTime: any;

  queryType = 'execute';
  interfaceType = 'execute';
  updataIsCheck = false;
  updataGridData: any; // 点击获取表格数据
  is_addres_updata: any = false; // 地址更新判断
  btnDisabled = {
    update: false,
    del: false
  };
  updateIdArray: any = [];
  removeIdArray: any = [];

  midArray: any;
  midArrays: any;
  unitDoors = [];

  pageNum: any; // 滚动表格的页码
  everyPageNum = 10; // 每页10条数据
  isFinallyPage = false; // 滚动加载的时候判断是否是最后一页数据
  isFinallyPageQuery = false; // 点击查询后滚动加载的时候判断是否是最后一页数据
  wait = true; // 防止多次滚动，导致同一时间重复请求滚动加载接口
  selectAddresses = [];
  nullgeoJson = {
    type: 'FeatureCollection',
    features: [{
      'type': 'Feature',
      'geometry': {
          'type': 'Point',
          'coordinates': []
      },
      'properties': {
      }
    }]
};
  drawControl: any;
  listener_add: any;
  listener_delete: any;
  listener_update: any;
  boolean = false;
  constructor(
    private ngbModalService: SmxModal,
    private appService: AppService,
    private httpService: HttpService,
    public toastService: ToastService,
  ) { }

  ngOnInit() {
    this.pageNum = 0;
    this.gridHeader = this.Headerdata;
    if (this.queryEndData) {
      this.initData(this.queryEndData.data);
    } else {
      if (this.interface_id && !this.interface_id.log) {
        this.initData();
      }
    }
    if (this.interface_id.del_id === 'address_id') {
      this.newLayer();
    }
  }


  initData(geoJson?: any) {
        this.updateIdArray = [];
        this.removeIdArray = [];
        this.selectAddresses = [];
        this.updateBtnStatus();
        if (!geoJson) {
          if ( this.interface_id.interface && this.interface_id.interface.queryType) {
            this.queryType = 'etl';
          }
          this.httpService.getData( {limit: this.everyPageNum, start: this.pageNum * this.everyPageNum} ,
            true, this.queryType, this.interface_id.interface.query, 'sprite')
            .subscribe(
          data => {
            if (data.data && data.data.result === -1) {
              const toastCfg = new ToastConfig(ToastType.WARNING, '', data.data.msg, 3000);
              this.toastService.toast(toastCfg);
              return;
            }
            if ((data as any).status < 0) {
              this.gridData = [] ;
            } else {
              if ((data as any).data.root) {
                this.gridData = (data as any).data.root;
                // 分页请求接口，每次都push到数组里
                // if ((data as any).data.root.length < this.everyPageNum) {
                //   this.isFinallyPage = true;
                // }
                // for (let i = 0; i < (data as any).data.root.length; i++) {
                //   this.gridData.push((data as any).data.root[i]);
                // }
              } else {
               this.gridData = (data as any).data;
                // if ((data as any).data.length < this.everyPageNum) {
                //   this.isFinallyPage = true;
                // }
                // for (let i = 0; i < (data as any).data.length; i++) {
                //   this.gridData.push((data as any).data[i]);
                // }
              }
              for ( const v of this.gridData ) {
                  if ( v['is_small'] || v['is_small'] === -1 ) {
                    v['is_small'] =  v['is_small'] === -1 ? '否' : '是';
                  }
                  if (v['is_change_ele'] || v['is_change_ele'] === -1 ) {
                    v['is_change_ele'] =  v['is_change_ele'] === -1 ? '否' : '是';
                  }
                  if (v['is_ps_pro'] || v['is_ps_pro'] === -1 ) {
                    v['is_ps_pro'] = v['is_ps_pro'] === -1 ? '否' : '是';
                  }
              }
              this.midArrays = this.gridData;

              this.midArray = deepCopy(this.gridData);
              if (this.gridData && this.gridData.length > 0 ) {
                for (let i = 0; i < this.gridData.length; i++) {
                  if (this.interface_id && this.interface_id.logDate) {
                    this.gridData[i].app_dates = dateFormat(new Date( this.gridData[i].app_date) , 'yyyy-MM-dd hh:mm:ss' );
                  } else {
                    this.gridData[i].app_dates = dateFormat(new Date( this.gridData[i].app_date));
                  }
                  if (this.gridData[i].is_main_company) {
                    this.gridData[i].is_main_companys = this.gridData[i].is_main_company === 1 ? '否' : '是';
                  }
                }
                if (data.data.totalSize) {
                  this.gridDataLength =  data.data.totalSize;
                } else {
                  this.gridDataLength =  this.gridData.length;
                }
              } else {
                this.gridDataLength = 0 ;
              }
            }
          },
          error => {
            toError(error);
          }
        );
    } else {
      // this.queryEndData = geoJson;
      if ((geoJson as any).data.root) {
        this.isFinallyPageQuery = false;
        this.isFinallyPage = true;
        this.pageNum = 0;
        this.gridData = (geoJson as any).data.root;
      } else {
        this.isFinallyPageQuery = false;
        this.pageNum = 0;
        this.isFinallyPage = true;
        this.gridData = (geoJson as any).data;
      }
      for ( const v of this.gridData ) {
        if ( v['is_small'] || v['is_small'] === -1 ) {
          v['is_small'] =  v['is_small'] === -1 ? '否' : '是';
        }
        if (v['is_change_ele'] || v['is_change_ele'] === -1 ) {
          v['is_change_ele'] =  v['is_change_ele'] === -1 ? '否' : '是';
        }
        if (v['is_ps_pro'] || v['is_ps_pro'] === -1 ) {
          v['is_ps_pro'] = v['is_ps_pro'] === -1 ? '否' : '是';
        }
      }
      this.midArray = this.gridData;
      this.midArray = deepCopy(this.midArray);
      if (this.gridData && this.gridData.length > 0 ) {
        for (let i = 0; i < this.gridData.length; i++) {
          if (this.interface_id && this.interface_id.logDate) {
            this.gridData[i].app_dates = dateFormat(new Date( this.gridData[i].app_date) , 'yyyy-MM-dd hh:mm:ss' );
            this.gridData[i].op_types = this.logStyle(this.gridData[i].op_type);
          } else {
            this.gridData[i].app_dates = dateFormat(new Date( this.gridData[i].app_date));
          }
          if (this.gridData[i].is_main_company) {
            this.gridData[i].is_main_companys = this.gridData[i].is_main_company === 1 ? '否' : '是';
          }
        }
        if (geoJson.data.totalSize) {
          this.gridDataLength =  geoJson.data.totalSize;
        } else {
          this.gridDataLength = this.gridData.length;
        }
      } else {
        this.gridDataLength = 0 ;
      }
    }
  }
  checkAll(e: any) {
    if (this.gridData.length > 0) {
      if (e.target.checked) {
        this.isAllChecked = true;
        for (let i = 0; i < this.gridData.length; i++) {
          this.checkItem(i, {target: {checked: true}}, this.gridData[i]);
        }
      } else {
        this.isAllChecked = false;
        for (let i = 0; i < this.gridData.length; i++) {
          this.gridData[i].checked = false;
        }
        this.updateIdArray = [];
        this.removeIdArray = [];
        this.selectAddresses = [];
        this.updateBtnStatus();
      }
    }

  }


  checkItem(index: any, e: any, item: any) {
    if (e.target.checked) {
      // 选中 要回显数据=
      for ( const v of this.midArray ) {
        if ( v['is_small']) {
          v['is_small'] =  v['is_small'] === '否' ? -1 : 1;
        }
        if (v['is_change_ele']) {
          v['is_change_ele'] =  v['is_change_ele'] === '否' ? -1 : 1;
        }
        if (v['is_ps_pro'] || v['is_ps_pro'] === '否' ) {
          v['is_ps_pro'] = v['is_ps_pro'] === '否' ? -1 : 1;
        }
      }
      this.updataGridData = this.midArray[index];
      // 需要更新的数据数组 --》判断更新状态
      this.gridData[index].checked = true;
      this.updateIdArray.push({index: index , value : this.gridData[index]});

      // 需要删除的数组
      const removeKeyValue: any = {};
      removeKeyValue[this.interface_id.del_id] = this.gridData[index][this.interface_id.del_id];
      this.removeIdArray.push(removeKeyValue);

      // 合并地址，存储选择的地址
      if (item.address_id) {
        this.selectAddresses.push(item);
      }
    } else {
      this.isAllChecked = false;
      for ( const j of this.updateIdArray ) {
        if ( this.cmp( j.value , this.gridData[index] ) ) {
            this.updateIdArray.splice(this.updateIdArray.indexOf(j), 1);
        }
      }
      const removeKeyValue: any = {};
      removeKeyValue[this.interface_id.del_id] = this.gridData[index][this.interface_id.del_id];
      for ( const v of this.removeIdArray ) {
        if ( this.cmp( v , removeKeyValue ) ) {
            this.removeIdArray.splice(this.removeIdArray.indexOf(v), 1);
        }
      }

      // 合并地址，删除掉已经选择的这条地址
      if (item.address_id) {
        for (let i = 0; i < this.selectAddresses.length; i++) {
          if (this.selectAddresses[i].address_id === item.address_id) {
            this.selectAddresses.splice(i, 1);
          }
        }
      }

    }
    this.updateBtnStatus();
  }
  /* 日志类型方法 */
  logStyle(event: any) {
    switch ( event ) {
      case 1: return '地址增加';
      case 2: return '地址修改';
      case 3: return '地址删除';
      case 4: return '门址增加';
      case 5: return '门址修改';
      case 6: return '门址删除';
      case 7: return '批量增加';
      case 8: return '批量修改';
      case 9: return '批量删除';
      case 10: return '批量导入';
    }
  }
  // 添加表格数据
  addNewData() {
    if (this.interface_id && this.interface_id.interface && this.interface_id.interface.addType) {
      this.interfaceType = 'etl';
    }
    this.nowTime =  new Date();
    const value = this.nowTime;
    const modal = this.ngbModalService.open(ModalComponent, {centered: true, backdrop: 'static'});
    modal.componentInstance.title = this.interface_id.interface.title.add;
    modal.componentInstance.appdate = {app_date: value };
    modal.componentInstance.data = this.interface_id.interface.field;
    modal.componentInstance.type = this.interface_id.interface.type.add;
    modal.componentInstance.selectData = this.selectData;
    modal.componentInstance.interface_id = this.interface_id;
    modal.componentInstance.isEdit = true;
    modal.result.then((result) => {
      // 添加数据
      if ( result && (result as any).isAddres ) {
        const lognote = '地址增加(现)(字段名)行政管理区:' + result.admin_area_name + '(字段名)业务管理区划:' + result.canton_name + '(字段名)用户站名称:' + result.user_station_name
        +  '(字段名)地址描述:' + result.addr_desc + '' ;
        this.httpService.getData(result, true, this.interfaceType , this.interface_id.interface.add, 'data')
        .subscribe(
          data => {
            if (data && data.status > 0) {
                  const newData = this.is_data_root(data);
                  const obj = {
                    addr_id: '',
                    gates: []
                  };
                  obj.addr_id = newData[0].address_id;
                  obj.gates = result.addresgates;
                  /* 插入添加地址的日志 */
                  const logobj = {
                    op_type: null ,
                    note: ''
                  };
                  logobj.op_type = 1;
                  logobj.note = lognote;
                  this.insertlog(logobj);  // 插入日志
                  this.httpService.getData(obj, true, 'etl' , 'addGates', 'data')
                  .subscribe(
                    dataw => {
                      if (( dataw as any ).status > 0) {
                        if ( result.isOne && result.addresgates.length === 1 ) {
                          const lognoteone = '门址增加(字段名)地址描述:' + result.addr_desc + '(字段名)门址描述:' + result.addresgates[0].gate_desc + '(字段名)端口号:' + result.addresgates[0].port_count + '';
                          const logobj_one = {
                            op_type: null ,
                            note: ''
                          };
                          logobj_one.op_type = 4;
                          logobj_one.note = lognoteone;
                          this.insertlog(logobj_one);
                        }
                        if ( result.isTwo && result.addresgates.length > 1 ) {
                          const lognoteMore = '批量增加单元门址信息(地址描述):' + result.addr_desc
                           + '(批量公式)首描述:' + result.isTwo.first_desc + '起始单元:' + result.isTwo.first_num + '结束单元:'
                            + result.isTwo.end_num + '中间链接字符:' + result.isTwo.mid_link +
                             '单元层数:' + result.isTwo.Layer_num + '房间个数:' + result.isTwo.room_num + '';
                          const logobjMore = {
                            op_type: null ,
                            note: ''
                          };
                          logobjMore.op_type = 7;
                          logobjMore.note = lognoteMore;
                          this.insertlog(logobjMore);
                        }
                        if (this.isFinallyPage === true) {
                          this.isFinallyPage = false;
                          this.pageNum = 0;
                        }
                        if (this.isFinallyPageQuery === true) {
                          this.isFinallyPageQuery = false;
                          this.pageNum = 0;
                        }
                        if (this.queryEndData) {
                          this.initData(this.queryEndData.data);
                        } else {
                          this.pageNum = 0 ;
                          this.initData();
                        }
                        this.updateIdArray = [];
                        this.removeIdArray = [];
                        this.selectAddresses = [];
                        const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '添加数据成功!', 2000);
                        this.toastService.toast(toastCfg);
                      } else {
                        this.updateIdArray = [];
                        this.removeIdArray = [];
                        this.selectAddresses = [];
                      }
                    },
                    error => {
                      toError(error);
                    }
                  );
            } else {
              this.updateIdArray = [];
              this.removeIdArray = [];
              this.selectAddresses = [];
            }
          },
          error => {
            toError(error);
          }
        );
      } else {
        this.httpService.getData(result, true, this.interfaceType , this.interface_id.interface.add, 'data')
        .subscribe(
          data => {
            if (( data as any ).status > 0) {
              if (this.isFinallyPage === true) {
                this.isFinallyPage = false;
                this.pageNum = 0;
              }
              if (this.isFinallyPageQuery === true) {
                this.isFinallyPageQuery = false;
                this.pageNum = 0;
              }
              if (this.queryEndData) {
                this.initData(this.queryEndData.data);
              } else {
                this.initData();
              }
              this.updateIdArray = [];
              this.removeIdArray = [];
              this.selectAddresses = [];
              const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '添加数据成功!', 2000);
              this.toastService.toast(toastCfg);
            } else {
              this.updateIdArray = [];
              this.removeIdArray = [];
              this.selectAddresses = [];
            }
          },
          error => {
           toError(error);
          }
        );
      }
      // 添加数据
    }, (reason) => {
    });
  }
  // 修改表格数据
  updateGridData() {
        if (this.interface_id && this.interface_id.interface && this.interface_id.interface.updataType) {
          this.interfaceType = 'etl';
          this.is_addres_updata = true;
        }
        const modal = this.ngbModalService.open(ModalComponent, {centered: true, backdrop: 'static'});
        modal.componentInstance.title = this.interface_id.interface.title.update;
        modal.componentInstance.appdate = {app_date: this.updataGridData.app_date};
        modal.componentInstance.data = this.updataGridData;
        modal.componentInstance.type = this.interface_id.interface.type.update;
        modal.componentInstance.selectData = this.selectData;
        modal.componentInstance.interface_id = this.interface_id;
        modal.componentInstance.addres_updata = this.is_addres_updata;
        modal.componentInstance.isEdit = false;
        modal.result.then((result) => {
          // 添加数据
          this.httpService.getData(result, true, this.interfaceType , this.interface_id.interface.update, '')
          .subscribe(
            data => {
                    if (data && data.status > 0 && data.data && data.data.result < 0) {
                      const toastCfg = new ToastConfig(ToastType.ERROR, '', '修改的数据已存在!', 2000);
                      this.toastService.toast(toastCfg);
                      return;
                    }
                    // 查询出数据，修改后滚动处理，防止无法执行滚动加载
                    if (( data as any ).status > 0) {
                      /* 地址 插入日志 */
                      if (this.interface_id.del_id === 'address_id') {
                        const lognoteu = '地址修改(原)(字段名)行政管理区:' + this.updataGridData.admin_area_name + '(字段名)业务管理区划' + this.updataGridData.canton_name + '(字段名)用户站名称' + this.updataGridData.user_station_name
                        + '(字段名)地址描述' + this.updataGridData.addr_desc + '(现)(字段名)行政管理区' + result.admin_area_name + '(字段名)业务管理区划' + result.canton_name
                        + '(字段名)用户站名称' + result.user_station_name + '(字段名)地址描述' + result.addr_desc + '';
                        const uplogobj = {
                          op_type: null ,
                          note: ''
                        };
                        uplogobj.note = lognoteu;
                        uplogobj.op_type = 2;
                        this.insertlog(uplogobj);
                      }
                      /* 插入日志 */
                      if (result && (result as any).isAddres) {
                            const newData = this.is_data_root(data);
                            const obj = {
                              addr_id: '',
                              gates: []
                            };
                            obj.addr_id = newData[0].address_id;
                            obj.gates = result.addresgates;
                            this.httpService.getData(obj, true, 'etl' , 'addGates', 'data')
                            .subscribe(
                              dataw => {
                                if ( result.isOne && result.addresgates.length === 1 ) {
                                  const lognoteone = '门址增加(字段名)地址描述:' + result.addr_desc + '(字段名)门址描述:' + result.addresgates[0].gate_desc + '(字段名)端口号:' + result.addresgates[0].port_count + '';
                                  const logobj_one = {
                                    op_type: null ,
                                    note: ''
                                  };
                                  logobj_one.op_type = 4;
                                  logobj_one.note = lognoteone;
                                  this.insertlog(logobj_one);
                                }
                                if ( result.isTwo && result.addresgates.length > 1 ) {
                                  const lognoteMore = '批量增加单元门址信息(地址描述):' + result.addr_desc
                                   + '(批量公式)首描述:' + result.isTwo.first_desc + '起始单元:' + result.isTwo.first_num + '结束单元:'
                                    + result.isTwo.end_num + '中间链接字符:' + result.isTwo.mid_link +
                                     '单元层数:' + result.isTwo.Layer_num + '房间个数:' + result.isTwo.room_num + '';
                                  const logobjMore = {
                                    op_type: null ,
                                    note: ''
                                  };
                                  logobjMore.op_type = 7;
                                  logobjMore.note = lognoteMore;
                                  this.insertlog(logobjMore);
                                }
                                this.pageNum = 0;
                                if (this.isFinallyPage === true) {
                                  this.isFinallyPage = false;
                                }
                                if (this.isFinallyPageQuery === true) {
                                  this.isFinallyPageQuery = false;
                                }
                                this.initData();
                                this.updateIdArray = [] ;
                                this.removeIdArray = [] ;
                                this.updateBtnStatus();
                                const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '修改数据成功!', 2000);
                                this.toastService.toast(toastCfg);
                              },
                              error => {
                                toError(error);
                              }
                            );
                      } else {
                        this.pageNum = 0;
                        if (this.isFinallyPage === true) {
                          this.isFinallyPage = false;
                        }
                        if (this.isFinallyPageQuery === true) {
                          this.isFinallyPageQuery = false;
                        }
                        this.initData();
                        this.updateIdArray = [] ;
                        this.removeIdArray = [] ;
                        this.updateBtnStatus();
                        const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '修改数据成功!', 2000);
                        this.toastService.toast(toastCfg);
                      }
                    } else {
                      this.updateIdArray = [] ;
                      this.removeIdArray = [] ;
                      this.updateBtnStatus();
                    }
            },
            error => {
              toError(error);
            }
          );
          // 添加数据
        }, (reason) => {
        });
  }
  // 删除表格数据
  delGridData() {
    if (this.interface_id && this.interface_id.interface && this.interface_id.interface.delType) {
      this.interfaceType = 'etl';
    }
    const modal = this.ngbModalService.open(ModalComponent, {centered: true, backdrop: 'static'});
    modal.componentInstance.title = this.interface_id.interface.title.del;
    modal.componentInstance.type = this.interface_id.interface.type.del;
     modal.result.then((result) => {
      /* 删除行政 业务 时判断是否被使用 */
      if (  this.interface_id.interface.is_used_admin || this.interface_id.interface.is_used_cant) {
        const obj = {
          common_id: '',
          type: null
        };
        if ( this.interface_id.interface.is_used_admin ) {
          obj.common_id = this.removeIdArray[0].admin_area_id;
          obj.type = 1;
        } else {
          obj.common_id = this.removeIdArray[0].canton_id;
          obj.type = 2;
        }
        this.httpService.getData( obj , true, 'etl', 'objectUsed' , 'sprite').subscribe(
          dataw => {
            if (dataw.data.result === 1 || dataw.data.result === -1) {
              const toastCfg = new ToastConfig(ToastType.WARNING, '', dataw.data.msg, 1000);
              this.toastService.toast(toastCfg);
              this.isAllChecked = false;
              return;
            } else {
              this.httpService.getData(this.removeIdArray[0], true, this.interfaceType , this.interface_id.interface.del, '')
              .subscribe(
                data => {
                  if ( data.status > 0 && (data as any).data.result === -1 ) {
                    const toastCfg = new ToastConfig(ToastType.WARNING, '', '该地址下有门址无法删除!', 1000);
                    this.toastService.toast(toastCfg);
                  } else {
                    if (( data as any ).status > 0) {
                      if (this.isFinallyPage === true) {
                        this.isFinallyPage = false;
                        this.pageNum = 0;
                      }
                      if (this.isFinallyPageQuery === true) {
                        this.isFinallyPageQuery = false;
                        this.pageNum = 0;
                      }
                      // 查询后 删除查询后的数据 进行回显
                      const delData = this.is_data_root(data);
                      if (this.queryEndData && this.queryEndData.data  && this.queryEndData.data.data.length > 0) {
                        for (let j = 0 ; j < delData.length ; j++ ) {
                          // 删除的数组循环
                          const updataId =  delData[j][this.interface_id.del_id];
                          for (let v = 0 ; v < this.queryEndData.data.data.length ; v++ ) {
                            // 查询的数组循环
                            if (this.queryEndData.data.data[v][this.interface_id.del_id] === updataId ) {
                              this.queryEndData.data.data.splice(v , 1);
                            }
                          }
                        }
                        this.initData(this.queryEndData.data);
                      } else {
                        this.initData();
                      }
                      this.updateIdArray = [] ;
                      this.removeIdArray = [] ;
                      this.selectAddresses = [];
                      this.updateBtnStatus();
                      this.isAllChecked = false;
                      const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '删除数据成功!', 2000);
                      this.toastService.toast(toastCfg);
                    } else {
                      this.updateIdArray = [] ;
                      this.removeIdArray = [] ;
                      this.selectAddresses = [];
                      this.updateBtnStatus();
                      this.isAllChecked = false;
                    }
                  }
                },
                error => {
                 toError(error);
                }
              );
            }
          },
          error => {
          }
        );
      } else {
      this.httpService.getData(this.removeIdArray[0], true, this.interfaceType , this.interface_id.interface.del, '')
      .subscribe(
        data => {
          if ( data.status > 0 && (data as any).data.result === -1 ) {
            const toastCfg = new ToastConfig(ToastType.WARNING, '', '该地址下有门址无法删除!', 1000);
            this.toastService.toast(toastCfg);
          } else {
            if (( data as any ).status > 0) {
              if (this.interface_id.del_id === 'address_id') {
                /* 删除地址日志 */
                const lognoteD = '地址删除(现)(字段名)行政管理区:' + this.updataGridData.admin_area_name + '(字段名)业务管理区划:' + this.updataGridData.canton_name + '(字段名)用户站名称:'
                + this.updataGridData.user_station_name + '(字段名)地址描述:' + this.updataGridData.addr_desc + '';
                const dellog = {
                  op_type: null ,
                  note: ''
                };
                dellog.note = lognoteD;
                dellog.op_type = 3;
                this.insertlog(dellog);
                /* 删除地址日志 */
              }
              if (this.isFinallyPage === true) {
                this.isFinallyPage = false;
                this.pageNum = 0;
              }
              if (this.isFinallyPageQuery === true) {
                this.isFinallyPageQuery = false;
                this.pageNum = 0;
              }
              // 查询后 删除查询后的数据 进行回显
              const delData = this.is_data_root(data);
              if (this.queryEndData && this.queryEndData.data  && this.queryEndData.data.data.length > 0) {
                for (let j = 0 ; j < delData.length ; j++ ) {
                  // 删除的数组循环
                  const updataId =  delData[j][this.interface_id.del_id];
                  for (let v = 0 ; v < this.queryEndData.data.data.length ; v++ ) {
                    // 查询的数组循环
                    if (this.queryEndData.data.data[v][this.interface_id.del_id] === updataId ) {
                      this.queryEndData.data.data.splice(v , 1);
                    }
                  }
                }
                this.initData(this.queryEndData.data);
              } else {
                this.initData();
              }
              this.updateIdArray = [] ;
              this.removeIdArray = [] ;
              this.selectAddresses = [];
              this.updateBtnStatus();
              this.isAllChecked = false;
              const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '删除数据成功!', 2000);
              this.toastService.toast(toastCfg);
            } else {
              this.updateIdArray = [] ;
              this.removeIdArray = [] ;
              this.selectAddresses = [];
              this.updateBtnStatus();
              this.isAllChecked = false;
            }
          }
        },
        error => {
         toError(error);
        }
      );


    }


    }, (reason) => {
    });




  }
  /* 插入日志方法 */
  insertlog(obj) {
    this.httpService.getData(obj, true, 'etl' , 'insertLog', 'data')
    .subscribe(
      datas => {
      },
      error => {
        toError(error);
      }
    );
  }
  // 修改button 状态
  updateBtnStatus() {
    if (this.updateIdArray.length !== 1) {
      this.btnDisabled.update = false;
    } else {
      this.btnDisabled.update = true;
    }
    // 删除按钮状态
    if (this.removeIdArray.length !== 1) {
      this.btnDisabled.del = false;
    } else {
      this.btnDisabled.del = true;
    }
  }

  /*
  * 判断两个对象是否相等,在取消选中事件时使用
  * */
  cmp(x: any, y: any) {
    if (x === y) {
      return true;
    }
    if (!(x instanceof Object) || !(y instanceof Object)) {
      return false;
    }
    if (x.constructor !== y.constructor) {
      return false;
    }
    for (const p in x) {
      if (x.hasOwnProperty(p)) {
        if (!y.hasOwnProperty(p)) {
          return false;
        }
        if (x[p] === y[p]) {
          continue;
        }
        if (typeof (x[p]) !== 'object') {
          return false;
        }
      }
    }
    for (const p in y) {
      if (y.hasOwnProperty(p) && !x.hasOwnProperty(p)) {
        return false;
      }
    }
    return true;
  }
  // 监听左右滑动a
  scrollLeft(event: any) {
    const left = event.target.scrollLeft;
    const thead = event.target.parentNode.childNodes[0];
    if (thead.getElementsByTagName('thead')[0] && thead.getElementsByTagName('thead')[0].style) {
      thead.getElementsByTagName('thead')[0].style.left = -left + 'px';
    }
  }
  loadNextPage(e: any) {
    // 当时全量返回的时候  不触发 滚动加载
    if ( this.interface_id.del_id === 'canton_id' || this.interface_id.del_id === 'admin_area_id' || this.interface_id.del_id === 'role_id' ) {
      return;
    }
    if (e.isReachingBottom) {
       if (!this.isFinallyPage && this.wait === true) {
         this.wait = false;
        // 加载表格数据
        // this.initData();
        // 全选按钮取消
        this.isAllChecked = false;

          if ( this.interface_id.interface && this.interface_id.interface.queryType) {
            this.queryType = 'etl';
          }
          this.httpService.getData( {limit: this.everyPageNum, start: this.pageNum * this.everyPageNum + 10} ,
            true, this.queryType, this.interface_id.interface.query, 'sprite')
            .subscribe(
          data => {
            if ((data as any).status < 0) {
              this.gridData = [] ;
            } else {
                // 每次滚动页码加1
                this.wait  = true;
                this.pageNum = this.pageNum + 1;
              if ((data as any).data.root) {
                // this.gridData = (data as any).data.root;
                // 分页请求接口，每次都push到数组里
                if ((data as any).data.root.length < this.everyPageNum) {
                  this.isFinallyPage = true;
                }
                for (let i = 0; i < (data as any).data.root.length; i++) {
                  // this.gridData.push((data as any).data.root[i]);
                  this.midArray.push((data as any).data.root[i]);
                }
              } else {
              // this.gridData = (data as any).data;
                if ((data as any).data.length < this.everyPageNum) {
                  this.isFinallyPage = true;
                }
                for (let i = 0; i < (data as any).data.length; i++) {
                  // this.gridData.push((data as any).data[i]);
                  this.midArray.push((data as any).data[i]);
                }
              }
              for ( const v of this.gridData ) {
                  if ( v['is_small'] || v['is_small'] === -1 ) {
                    v['is_small'] =  v['is_small'] === -1 ? '否' : '是';
                  }
                  if (v['is_change_ele'] || v['is_change_ele'] === -1 ) {
                    v['is_change_ele'] =  v['is_change_ele'] === -1 ? '否' : '是';
                  }
                  if (v['is_ps_pro'] || v['is_ps_pro'] === -1 ) {
                    v['is_ps_pro'] = v['is_ps_pro'] === -1 ? '否' : '是';
                  }
              }

              // this.midArrays = this.gridData;
              this.gridData = deepCopy(this.midArray);
              if (this.gridData && this.gridData.length > 0 ) {
                for (let i = 0; i < this.gridData.length; i++) {
                  if (this.interface_id && this.interface_id.logDate) {
                    this.gridData[i].app_dates = dateFormat(new Date( this.gridData[i].app_date) , 'yyyy-MM-dd hh:mm:ss' );
                    this.gridData[i].op_types = this.logStyle(this.gridData[i].op_type);
                  } else {
                    this.gridData[i].app_dates = dateFormat(new Date( this.gridData[i].app_date));
                  }
                  if (this.gridData[i].is_main_company) {
                    this.gridData[i].is_main_companys = this.gridData[i].is_main_company === 1 ? '否' : '是';
                  }
                }
                if (data.data.totalSize) {
                  this.gridDataLength =  data.data.totalSize;
                } else {
                  this.gridDataLength =  this.gridData.length;
                }
              } else {
                this.gridDataLength = 0 ;
              }
            }
          },
          error => {
           toError(error);
          }
        );
       } else {

      }

      if (this.queryEndData) {
        if (!this.isFinallyPageQuery ) {
          this.pageNum = this.pageNum + 1;
          this.queryEndData.queryCriteria.limit = this.everyPageNum;
          this.queryEndData.queryCriteria.start = this.pageNum * this.everyPageNum;
          if ( this.interface_id.interface && this.interface_id.interface.queryType) {
            this.queryType = 'etl';
          }
          this.httpService.getData(this.queryEndData.queryCriteria,
            true, this.queryType, this.interface_id.interface.query , 'sprite')
            .subscribe(
            data => {
              if ( (data as any).data && data.status > 0 ) {
                const Data = this.is_data_root(data);
                if (Data.length < this.everyPageNum) {
                    this.isFinallyPageQuery = true;
                }
               for (let i = 0; i < Data.length; i++) {
                  this.gridData.push(Data[i]);
               }

                  for ( const v of this.gridData ) {
                    if ( v['is_small'] || v['is_small'] === -1 ) {
                      v['is_small'] =  v['is_small'] === -1 ? '否' : '是';
                    }
                    if (v['is_change_ele'] || v['is_change_ele'] === -1 ) {
                      v['is_change_ele'] =  v['is_change_ele'] === -1 ? '否' : '是';
                    }
                    if (v['is_ps_pro'] || v['is_ps_pro'] === -1 ) {
                      v['is_ps_pro'] = v['is_ps_pro'] === -1 ? '否' : '是';
                    }
                }
                this.midArrays = this.gridData;
                this.midArray = deepCopy(this.midArrays);
                if (this.gridData && this.gridData.length > 0 ) {
                  for (let i = 0; i < this.gridData.length; i++) {
                    if (this.interface_id && this.interface_id.logDate) {
                      this.gridData[i].app_dates = dateFormat(new Date( this.gridData[i].app_date) , 'yyyy-MM-dd hh:mm:ss' );
                      this.gridData[i].op_types = this.logStyle(this.gridData[i].op_type);
                    } else {
                      this.gridData[i].app_dates = dateFormat(new Date( this.gridData[i].app_date));
                    }
                    if (this.gridData[i].is_main_company) {
                      this.gridData[i].is_main_companys = this.gridData[i].is_main_company === 1 ? '否' : '是';
                    }
                  }
                  if (data.data.totalSize) {
                    this.gridDataLength = data.data.totalSize;
                  } else {
                    this.gridDataLength =  this.gridData.length;
                  }
                } else {
                  this.gridDataLength = 0 ;
                }
              }
            },
            error => {
              toError(error);
            }
          );
        }
      }
    }
  }

  /* 地址合并 */
  combinAddress() {
    if (this.selectAddresses.length > 2 || this.selectAddresses.length < 2) {
      const toastCfg = new ToastConfig(ToastType.WARNING, '', '请选择两条地址进行合并', 1000);
      this.toastService.toast(toastCfg);
    } else {
      const modal = this.ngbModalService.open(ModalComponent, {centered: true, backdrop: 'static'});
      modal.componentInstance.title = {name: '合并地址  (请选择一个需要保留的地址)'};
      modal.componentInstance.type = this.interface_id.interface.type.other.one;
      modal.componentInstance.data = {combineData: this.selectAddresses};
      modal.result.then((result) => {
        let active_address_id = null;
        let abandon_address_id = null;
        for (let i = 0; i < result.combineData.length; i++) {
          if ( result.combineData[i].selecType === 1) {
           active_address_id = result.combineData[i].address_id;
          } else {
           abandon_address_id = result.combineData[i].address_id;
          }
        }
        const body = {
          active_address_id: active_address_id,
          abandon_address_id: abandon_address_id
        };
        this.httpService.getData(body, true, 'etl', 'combineAddress', 'data')
        .subscribe(
          data => {
              if ((data as any).status > 0 && (data as any).data) {
                this.pageNum = 0;
                if (this.isFinallyPage === true) {
                  this.isFinallyPage = false;
                }
                if (this.isFinallyPageQuery === true) {
                  this.isFinallyPageQuery = false;
                }
                this.selectAddresses = [];
                this.initData();
                this.updateIdArray = [] ;
                this.removeIdArray = [] ;
                this.selectAddresses = [];
                this.updateBtnStatus();
                this.isAllChecked = false;
                const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '合并成功', 1000);
                this.toastService.toast(toastCfg);
              }
          },
          error => {
            toError(error);
          }
        );
      }, (reason) => {
      });
    }
  }

  /* 分配小区 */
  distributeResicommunity() {
    if (this.selectAddresses.length < 1) {
      const toastCfg = new ToastConfig(ToastType.WARNING, '', '请选择地址', 1000);
      this.toastService.toast(toastCfg);
    } else {
      const modal = this.ngbModalService.open(ModalComponent, {centered: true, backdrop: 'static'});
      modal.componentInstance.title = {name: '分配小区'};
      modal.componentInstance.type = this.interface_id.interface.type.other.two;
      modal.componentInstance.data = {distributeData: this.selectAddresses};
      modal.result.then((result) => {
        const addr =   [];
        for (let i = 0; i < this.selectAddresses.length; i++) {
            addr.push(this.selectAddresses[i].address_id);
        }
        const body = {
          address_id_array: [],
          common_id: null,
          type: 1
        };
        body.address_id_array = addr;
        body.common_id = result.needId;
        this.httpService.getData(body, true, 'etl', 'updateAddrRlt', 'data')
        .subscribe(
          data => {
              if ((data as any).status > 0 && (data as any).data) {
                this.pageNum = 0;
                if (this.isFinallyPage === true) {
                  this.isFinallyPage = false;
                }
                if (this.isFinallyPageQuery === true) {
                  this.isFinallyPageQuery = false;
                }
                this.selectAddresses = [];
                this.initData();
                this.updateIdArray = [] ;
                this.removeIdArray = [] ;
                this.selectAddresses = [];
                this.updateBtnStatus();
                this.isAllChecked = false;
                const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '分配成功', 1000);
                this.toastService.toast(toastCfg);
              }
          },
          error => {
            toError(error);
          }
        );
      }, (reason) => {
      });
    }
  }

  /* 分配社区 */
  distributeCommunity() {
    if (this.selectAddresses.length < 1) {
      const toastCfg = new ToastConfig(ToastType.WARNING, '', '请选择地址', 1000);
      this.toastService.toast(toastCfg);
    } else {
      const modal = this.ngbModalService.open(ModalComponent, {centered: true, backdrop: 'static'});
      modal.componentInstance.title = {name: '分配社区'};
      modal.componentInstance.type = this.interface_id.interface.type.other.three;
      modal.componentInstance.data = {distributeData: this.selectAddresses};
      modal.result.then((result) => {
        const addr = [];
        for (let i = 0; i < this.selectAddresses.length; i++) {
            addr.push(this.selectAddresses[i].address_id);
        }
        const body = {
          address_id_array: [],
          common_id: null,
          type: 2
        };
        body.address_id_array = addr;
        body.common_id = result.needId;
        this.httpService.getData(body, true, 'etl', 'updateAddrRlt', 'data')
        .subscribe(
          data => {
              if ((data as any).status > 0 && (data as any).data) {
                this.pageNum = 0;
                if (this.isFinallyPage === true) {
                  this.isFinallyPage = false;
                }
                if (this.isFinallyPageQuery === true) {
                  this.isFinallyPageQuery = false;
                }
                this.selectAddresses = [];
                this.initData();
                this.updateIdArray = [] ;
                this.removeIdArray = [] ;
                this.selectAddresses = [];
                this.updateBtnStatus();
                this.isAllChecked = false;
                const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '分配成功', 1000);
                this.toastService.toast(toastCfg);
              }
          },
          error => {
            toError(error);
          }
        );
      }, (reason) => {
      });
    }
  }

  /* 分配片区 */
  distributeSlipCommunity() {
    if (this.selectAddresses.length < 1) {
      const toastCfg = new ToastConfig(ToastType.WARNING, '', '请选择地址', 1000);
      this.toastService.toast(toastCfg);
    } else {
      const modal = this.ngbModalService.open(ModalComponent, {centered: true, backdrop: 'static'});
      modal.componentInstance.title = {name: '分配片区'};
      modal.componentInstance.type = this.interface_id.interface.type.other.four;
      modal.componentInstance.data = {distributeData: this.selectAddresses};
      modal.result.then((result) => {
        const addr = [];
        for (let i = 0; i < this.selectAddresses.length; i++) {
            addr.push(this.selectAddresses[i].address_id);
        }
        const body = {
          address_id_array: [],
          common_id: null,
          type: 3
        };
        body.address_id_array = addr;
        body.common_id = result.needId;
        this.httpService.getData(body, true, 'etl', 'updateAddrRlt', 'data')
        .subscribe(
          data => {
              if ((data as any).status > 0 && (data as any).data) {
                this.pageNum = 0;
                if (this.isFinallyPage === true) {
                  this.isFinallyPage = false;
                }
                if (this.isFinallyPageQuery === true) {
                  this.isFinallyPageQuery = false;
                }
                this.selectAddresses = [];
                this.initData();
                this.updateIdArray = [] ;
                this.removeIdArray = [] ;
                this.selectAddresses = [];
                this.updateBtnStatus();
                this.isAllChecked = false;
                const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '分配成功', 1000);
                this.toastService.toast(toastCfg);
              }
          },
          error => {
            toError(error);
          }
        );
      }, (reason) => {
      });
    }
  }
  /* 分配街道 */
  distributeStreet() {
    if (this.selectAddresses.length < 1) {
      const toastCfg = new ToastConfig(ToastType.WARNING, '', '请选择地址', 1000);
      this.toastService.toast(toastCfg);
    } else {
      const modal = this.ngbModalService.open(ModalComponent, {centered: true, backdrop: 'static'});
      modal.componentInstance.title = {name: '分配街道'};
      modal.componentInstance.type = this.interface_id.interface.type.other.five;
      modal.componentInstance.data = {distributeData: this.selectAddresses};
      modal.result.then((result) => {
        const addr = [];
        for (let i = 0; i < this.selectAddresses.length; i++) {
            addr.push(this.selectAddresses[i].address_id);
        }
        const body = {
          address_id_array: [],
          common_id: null,
          type: 4
        };
        body.address_id_array = addr;
        body.common_id = result.needId;
        this.httpService.getData(body, true, 'etl', 'updateAddrRlt', 'data')
        .subscribe(
          data => {
              if ((data as any).status > 0 && (data as any).data) {
                this.pageNum = 0;
                if (this.isFinallyPage === true) {
                  this.isFinallyPage = false;
                }
                if (this.isFinallyPageQuery === true) {
                  this.isFinallyPageQuery = false;
                }
                this.selectAddresses = [];
                this.initData();
                this.updateIdArray = [] ;
                this.removeIdArray = [] ;
                this.selectAddresses = [];
                this.updateBtnStatus();
                this.isAllChecked = false;
                const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '分配成功', 1000);
                this.toastService.toast(toastCfg);
              }
          },
          error => {
            toError(error);
          }
        );
      }, (reason) => {
      });
    }
  }

  /* 分配用户站 */
  distributeManage() {
    if (this.selectAddresses.length < 1) {
      const toastCfg = new ToastConfig(ToastType.WARNING, '', '请选择地址', 1000);
      this.toastService.toast(toastCfg);
    } else {
      const modal = this.ngbModalService.open(ModalComponent, {centered: true, backdrop: 'static'});
      modal.componentInstance.title = {name: '分配用户站'};
      modal.componentInstance.type = this.interface_id.interface.type.other.six;
      modal.componentInstance.data = {distributeData: this.selectAddresses , isuserStation: true};
      modal.result.then((result) => {
        const addr = [];
        for (let i = 0; i < this.selectAddresses.length; i++) {
            addr.push(this.selectAddresses[i].address_id);
        }
        const body = {
          address_id_array: [],
          common_id: null,
          type: 5
        };
        body.address_id_array = addr;
        body.common_id = result.needId;
        this.httpService.getData(body, true, 'etl', 'updateAddrRlt', 'data')
        .subscribe(
          data => {
              if ((data as any).status > 0 && (data as any).data) {
                this.pageNum = 0;
                if (this.isFinallyPage === true) {
                  this.isFinallyPage = false;
                }
                if (this.isFinallyPageQuery === true) {
                  this.isFinallyPageQuery = false;
                }
                this.selectAddresses = [];
                this.initData();
                this.updateIdArray = [] ;
                this.removeIdArray = [] ;
                this.selectAddresses = [];
                this.updateBtnStatus();
                this.isAllChecked = false;
                const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '分配成功', 1000);
                this.toastService.toast(toastCfg);
              }
          },
          error => {
            toError(error);
          }
        );
      }, (reason) => {
      });
    }
  }
  // 对全量或分页 进行适配
  is_data_root(data: any) {
    if (data.data && data.data.root) {
      return data.data.root;
    } else {
      return data.data;
    }
  }


  doorUpdate(item: any) {
    const body = {
      address_id: item.address_id
    };
    this.httpService.getData(body, true, 'execute', 'e1f4f47c-fb41-4c47-b4f4-3a1e6973a172', 'data')
    .subscribe(
      data => {
          if ((data as any).status > 0 && (data as any).data) {
            // this.unitDoors = (data as any).data;
            this.unitDoors = this.is_data_root(data);
            if (this.unitDoors.length > 0) {
              for (let i = 0; i < this.unitDoors.length; i++) {
                if (this.unitDoors[i].port_count === '') {
                  this.unitDoors[i].port_count = null;
                }
                this.unitDoors[i]['addr_desc'] = item.addr_desc;
                this.unitDoors[i]['arch_form'] = item.arch_form;
              }
            }else {
                  this.unitDoors.push({});
                  this.unitDoors[0]['addr_desc'] = item.addr_desc;
                  this.unitDoors[0]['address_id'] = item.address_id;
                  this.unitDoors[0]['arch_form'] = item.arch_form;
            }
            const modal = this.ngbModalService.open(ModalComponent, {centered: true, backdrop: 'static'});
            modal.componentInstance.title = {name: '门址修改'};
            modal.componentInstance.type = this.interface_id.interface.type.other.seven;
            modal.componentInstance.data = {unitDoorData: this.unitDoors};

          }
      },
      error => {
        toError(error);
      }
    );
  }
  newLayer() {
    if (this.mapObj.getSource('layerSource_point') && this.mapObj.getLayer('layer_gehua_point') ) {
      return;
    }
    this.mapObj.addSource('layerSource_point', {
      data: {
        type: 'FeatureCollection',
        features: [{
          'type': 'Feature',
          'geometry': {
              'type': 'Point',
              'coordinates': []
          },
          'properties': {
          }
        }]
    },
      type: 'geojson'
    });
  // 添加点的图层
    this.mapObj.addLayer({
      'id': 'layer_gehua_point',
      'type': 'symbol',
      'source': 'layerSource_point',
      'layout': {
        'text-size': 11,
        'text-font': [
          'Microsoft YaHei Regular'
        ],
        'text-offset': [
          0,
          0.5
        ],
        'icon-image': '620401',
        'text-anchor': 'top',
        'text-max-width': 8,
        'icon-size': 1
      },
      'paint': {
        'text-color': '#666',
        'text-halo-width': 1,
        'text-halo-color': 'rgba(255,255,255,0.75)',
        'text-halo-blur': 1
      }
    });
  }

  addPoint(item: any) {

    this.minWindow.emit('min');
    if (this.mapObj.getSource('layerSource_point')) {
      this.nullgeoJson.features[0].geometry.coordinates = [];
      this.mapObj.getSource('layerSource_point').setData(this.nullgeoJson);
    }
    if (item && item.pointx && item.pointy && item.pointx !== '' && item.pointy !== '') {
     const obj = {
      center: [],
      zoom: 15
      };
      obj.center[0] = Number(item.pointx);
      obj.center[1] = Number(item.pointy);
      this.mapObj.jumpTo(obj);
      this.newLayer();
      this.nullgeoJson.features[0].geometry.coordinates = obj.center;
      this.mapObj.getSource('layerSource_point').setData(this.nullgeoJson);
    }
    const self = this;
    if (this.drawControl) {
      this.mapObj.removeControl(this.drawControl);
      this.mapObj.off('draw.create', this.listener_add);
    }
    this.drawControl = new smartmapx.DrawControl({
      displayControlsDefault: false,
      controls: {
        point: false,
        line_string: false,
        polygon: false,
        trash: false
      }
    });
    this.mapObj.addControl(this.drawControl, 'top-right');
    this.drawControl.changeMode('draw_point');

    this.listener_add = function (e: any) {
      const modal = self.ngbModalService.open(ModalComponent, {centered: true, backdrop: 'static'});
      modal.componentInstance.title = {name: '标注信息'};
      modal.componentInstance.type = 30;
      modal.componentInstance.data = {desc: item.addr_desc };
      modal.result.then((result) => {
        if (self.mapObj.getSource('layerSource_point')) {
          self.nullgeoJson.features[0].geometry.coordinates = [];
          self.mapObj.getSource('layerSource_point').setData(self.nullgeoJson);
        }
        self.mapObj.off('draw.create', self.listener_add);
        const body = {
          address_id: null,
          pointx: '',
          pointy: ''
        };
        body.address_id = item.address_id;
        body.pointx = e.features[0].geometry.coordinates[0].toString();
        body.pointy = e.features[0].geometry.coordinates[1].toString();

        self.httpService.getData(body, true, 'execute', '7a106985-f17e-45cd-8f42-d9596aa24069', 'data')
        .subscribe(
          data => {
            if (data && data.status > 0) {
              const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '地图标注成功！', 1000);
              self.toastService.toast(toastCfg);
            }
          },
          error => {
            toError(error);
          }
        );
      }, (reason) => {
        if (self.drawControl) {
          self.mapObj.removeControl(self.drawControl);
          self.mapObj.off('draw.create', self.listener_add);
          self.drawControl = undefined;
          self.markPointObj.emit(this.drawControl);
        }
      });
    };


    this.mapObj.on('draw.create', this.listener_add);
    if (this.drawControl) {
      this.markPointObj.emit(this.drawControl);
    }
  }


  /* 地址详情 */
  descFun(item: any , event: any) {
    const modal = this.ngbModalService.open(ModalComponent, {centered: true, backdrop: 'static'});
    modal.componentInstance.title = {name: '地址详情'};
    modal.componentInstance.type = this.interface_id.interface.type.other.eight;
    modal.componentInstance.addresGat = item;
    modal.componentInstance.data = {desc: true};
  }
}
