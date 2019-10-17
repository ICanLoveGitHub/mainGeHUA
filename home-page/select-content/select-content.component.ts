import { Component, OnInit, Input, Output, EventEmitter, ViewChildren, ViewChild, QueryList, AfterViewInit, ElementRef, Renderer2, HostListener } from '@angular/core';
import {HttpService} from '../../../s-service/http.service';
import {toError} from 'src/app/smx-component/smx.module';
import { deepCopy, dateFormat } from 'src/app/smx-component/smx-util';

@Component({
  selector: 'select-content',
  templateUrl: './select-content.component.html',
  styleUrls: ['./select-content.component.scss']
})
export class SelectContentComponent implements OnInit {

  @Input() interface_id: any; // 入口 所有信息
  @Input() selectData: any; // 下拉框数据
  @Output() queryStreet = new EventEmitter(); // 向上抛出查询的数据
  /*  [optionValue]">{{ v[optionLabel]}*/
  selectValue: any = [];
  selectName: any;
  inputName: any;
  inputValue = '请输入';
  queryType = 'execute';
  inputValue_think = '';
  inputContent = '';
  startDate: any;
  endDate: any;
  think_position = true;
  is_click_think = false;
  is_have_think = false ; // 联想输入框 状态
  setTime: any;
  mokuai_lianxiang: any;
  is_com_haveThink = false;
  is_desc_haveThink = false;
  is_street_haveThink = false;
  is_res_haveThink = false;
  addres_ismark = [
    {label: '', value: -1},
    {label: '已标注', value: 1},
    {label: '未标注', value: 0}
  ];
  logselectData = [
    {label: '', value: null},
    {label: '地址增加', value: 1},
    {label: '地址修改', value: 2},
    {label: '地址删除', value: 3},
    {label: '门址增加', value: 4},
    {label: '门址修改', value: 5},
    {label: '门址删除', value: 6},
    {label: '批量增加', value: 7},
    {label: '批量修改', value: 8},
    {label: '批量删除', value: 9},
    {label: '批量导入', value: 10}
  ];
  thinkData: any = [];
  select_json = {
    streetManage: {
      admin_area_id: null,
      street_name: '',
      limit: 10,
      start: 0,
    },
    community: {
      admin_area_id: null,
      community_name: '',
      limit: 10,
      start: 0,
    },
    resicommunity: {
      admin_area_id: null,
      resi_name: '',
      limit: 10,
      start: 0,
    },
    slipCommunity: {
      slip_community_type_id: null,
      slip_community_name: '',
      limit: 10,
      start: 0,
    },
    streetManage_think: {
      street_name: ''
    },
    community_think: {
      community_name: ''
    },
    resicommunityy_think: {
      resi_name: ''
    },
    slipCommunityy_think: {
      slip_community_name: ''
    }
  };
  // 地址更新 查询 功能需要的下拉框数据
  street_name: any;
  addres_desc: any;
  resi_name: any;
  slip_community_name: any;
  addres_json = {
    limit: 10 ,
    start: 0 ,
    user_station_id: null,
    canton_id: null,
    admin_area_id: null,
    street_name: null,
    addr_desc: null,
    slip_community_name: null,
    resi_name: null,
    is_marked: null
  };
  // 日志查询
  log_json = {
    limit: 10 ,
    start: 0 ,
    op_type: null,
    operator_name: '',
    note: '',
    start_time: null,
    end_time: null
  };
  // 操作员维护
  opertor_json = {
    limit: 10 ,
    start: 0 ,
    user_station_id: null,
    company_id: null,
    username: ''
  };
  // 传入查询条件
  add_adminArea_query = [
    {label: '', value: -1},
  ];  // 行政管理区划
  add_canton_query = [
    {label: '', value: -1},
  ]; // 业务管理区划
  add_user_station_query = [
    {label: '', value: -1},
  ]; // 用户站
  branchcompany = [
    {label: '', value: -1},
  ]; // 分公司列表
  // 地址更新 查询 功能需要的下拉框数据
  constructor( public httpService: HttpService) { }

  ngOnInit() {
    this.selectName = this.interface_id.interface.select.slecetName;
    this.inputName = this.interface_id.interface.select.inputName;
    const obj = {
      label: '',
      value: null
     };
     this.selectValue.push(obj);
    if (this.selectData) {
      if (this.interface_id) {
        let SDate;
        if (this.selectData.root) {
          SDate = this.selectData.root;
        } else {
          SDate = this.selectData;
        }
        for ( const v of SDate) {
           const obj1 = {
            label: '',
            value: 1
           };
           obj1.label = v[this.interface_id.interface.queryName.label];
           obj1.value = v[this.interface_id.interface.queryName.value];
           this.selectValue.push(obj1);
        }
      }
    }
    // 地址更新 部分
    if ( this.interface_id && this.interface_id.interface && this.interface_id.interface.queryName && this.interface_id.interface.queryName.addupdata ) {
      this.adderss_query_needData();
    }
    // 操作员维护部分
    if ( this.interface_id && this.interface_id.del_id && this.interface_id.del_id === 'oper_id' ) {
      this.operatorsSelect();
    }
  }
  changeSelect(event: any) {
    this.select_json[this.interface_id.interface.queryName.selectName][this.interface_id.interface.queryName.value] = event;
  }
  changInputValue(event: any) {
    if ( event === '街道名称' ) {
      this.think_position = true;
      this.select_json.streetManage_think.street_name = this.inputValue_think;
      this.thinkInterface(this.select_json.streetManage_think , 'street_name' , '41559c86-407d-409c-8cfa-a633ecffd189');
    } else if ( event === '小区名称' ) {
      this.think_position = true;
      this.select_json.resicommunityy_think.resi_name = this.inputValue_think;
      this.thinkInterface(this.select_json.resicommunityy_think , 'resi_name' , '9682a02e-c856-4ffe-9179-5be7d17c9356');
    } else if ( event === '社区名称' ) {
      this.think_position = true;
      this.select_json.community_think.community_name = this.inputValue_think;
      this.thinkInterface(this.select_json.community_think , 'community_name' , 'ca81ec7d-fa9f-4f0a-abcc-78f010b90b56');
    } else if ( event === '片区名称' ) {
      this.think_position = false;
      this.select_json.slipCommunityy_think.slip_community_name = this.inputValue_think;
      this.thinkInterface(this.select_json.slipCommunityy_think , 'slip_community_name' , '24973a36-5b26-470a-a118-370c0b5c1a3f');
    }
  }
  thinkInterface(e: any , name: any , url: any) {
    clearInterval(this.mokuai_lianxiang);
    this.mokuai_lianxiang = setTimeout(() => {
      this.httpService.getData(e,
        true, 'execute', url, 'sprite')
        .subscribe(
        data => {
          this.thinkData = [];
          if (data.status > 0) {
            if (data.data && (data as any).data.length > 0) {
              for ( const v of (data as any).data ) {
                this.thinkData.push(v[name]);
                this.is_have_think = true;
              }
            }
          }
        },
        error => {
         toError(error);
        }
      );
    }, 1000);
  }
  thinkclick(item: any) {
    this.inputValue_think = item;
    this.is_have_think = false;
  }
  // 地址更新 查询下拉框部分、
/*   add_adminArea_query = [];  // 行政管理区划
  add_canton_query = []; // 业务管理区划
  add_user_station_query = []; // 用户站 */
  adderss_query_needData() {
    // 业务管理区划
      this.httpService.getData( {} ,
        true, 'execute', '19a4d1f7-4a3a-4e31-b184-8e3b1727afff', 'sprite')
        .subscribe(
          data => {
            if ( (data as any).status > 0 && (data as any).data) {
              let Data;
              if ((data as any).data.root) {
                Data = (data as any).data.root;
              } else {
                Data = (data as any).data;
              }
              for (const v of Data) {
                const canton_obj = {
                  label: '',
                  value: 0
                };
                canton_obj.label = v.canton_name;
                canton_obj.value = v.canton_id;
                this.add_canton_query.push(canton_obj);
              }
            }
          },
          error => {
           toError(error);
          }
      );
      // 行政管理区划
      this.httpService.getData( {} ,
        true, 'execute', '58f98e71-4810-4e6f-8c89-1c3ba86dcc5b', 'sprite')
        .subscribe(
          data => {
            if ( (data as any).status > 0 && (data as any).data) {
              let Data;
              if ((data as any).data.root) {
                Data = (data as any).data.root;
              } else {
                Data = (data as any).data;
              }
              for (const v of Data) {
                const canton_obj = {
                  label: '',
                  value: 0
                };
                canton_obj.label = v.admin_area_name;
                canton_obj.value = v.admin_area_id;
                this.add_adminArea_query.push(canton_obj);
              }
            }
          },
          error => {
            toError(error);
          }
      );
      // 用户站
      this.httpService.getData( {} ,
        true, 'execute', 'c9353003-285c-4d2a-bfc9-d37ebd84990f', 'sprite')
        .subscribe(
          data => {
            if ( (data as any).status > 0 && (data as any).data) {
              let Data;
              if ((data as any).data.root) {
                Data = (data as any).data.root;
              } else {
                Data = (data as any).data;
              }
              for (const v of Data) {
                const canton_obj = {
                  label: '',
                  value: 0
                };
                canton_obj.label = v.user_station_name;
                canton_obj.value = v.user_station_id;
                this.add_user_station_query.push(canton_obj);
              }
            }
          },
          error => {
           toError(error);
          }
      );
  }
  //  操作员维护 查询下拉框
  operatorsSelect() {
     // 用户站
     this.httpService.getData( {} ,
      true, 'execute', 'c9353003-285c-4d2a-bfc9-d37ebd84990f', 'sprite')
      .subscribe(
        data => {
          if ( (data as any).status > 0 && (data as any).data) {
            let Data;
            if ((data as any).data.root) {
              Data = (data as any).data.root;
            } else {
              Data = (data as any).data;
            }
            for (const v of Data) {
              const canton_obj = {
                label: '',
                value: 0
              };
              canton_obj.label = v.user_station_name;
              canton_obj.value = v.user_station_id;
              this.add_user_station_query.push(canton_obj);
            }
          }
        },
        error => {
         toError(error);
        }
    );
    // 分公司列表
    this.httpService.getData( {} ,
      true, 'etl', 'queryCompanyByUser', '')
      .subscribe(
        data => {
          if ( (data as any).status > 0 && (data as any).data) {
            /* let Data; */
            /* if ((data as any).data.root) {
              Data = (data as any).data.root;
            } else {
              Data = (data as any).data;
            } */
            const Data = (data as any).data.companys;
            for (const v of Data) {
              const canton_obj = {
                label: '',
                value: 0
              };
              canton_obj.label = v.company_name;
              canton_obj.value = v.company_id;
              this.branchcompany.push(canton_obj);
            }
          }
        },
        error => {
         toError(error);
        }
    );
  }
  /* addres_json = {
    user_station_id: null,
    canton_id: null,
    admin_area_id: null,
    street_name: null,
    addr_desc: null,
    resi_name: null
  }; */
  // 地址更新  修改查询条件中的参数
  changeAddQuery(event: any , name: any) {
    if (name === 'user' ) {
      if ( event !== -1) {
        this.addres_json.user_station_id = event;
      } else {
        this.addres_json.user_station_id = null;
      }
    } else if (name === 'admin') {
      if ( event !== -1) {
        this.addres_json.admin_area_id = event;
      } else {
        this.addres_json.admin_area_id = null;
      }
    } else if (name === 'contan') {
      if ( event !== -1) {
        this.addres_json.canton_id = event;
      } else {
        this.addres_json.canton_id = null;
      }
    } else if (name === 'biaozhu') {
      if (event === -1) {
        this.addres_json.is_marked = null;
      } else {
        this.addres_json.is_marked = event;
      }
    }
  }
  addresInput(event: any) {
    clearInterval(this.setTime);
    this.setTime = setTimeout(() => {
       if (event === 'street') {
         this.addres_json.street_name = this.street_name;
         const obj = {
           street_name: ''
         };
         obj.street_name = this.street_name;
         const url = '41559c86-407d-409c-8cfa-a633ecffd189';
         this.thinkaddres(obj, url, 'street_name');
       } else if (event === 'desc') {
         // 获取长度，last=1
         // 下一次获取长度 。长度等于last
         this.addres_json.addr_desc = this.addres_desc;
         const obj = {
           addr_desc: ''
         };
         obj.addr_desc = this.addres_desc;
         const url = '6cb744f1-a40e-4c58-8478-e5f781ffaa90';
         this.thinkaddres(obj, url, 'addr_desc');
       } else if (event === 'resname') {
         this.addres_json.resi_name = this.resi_name;
         const obj = {
           resi_name: ''
         };
         obj.resi_name = this.resi_name;
         const url = '9682a02e-c856-4ffe-9179-5be7d17c9356';
         this.thinkaddres(obj, url, 'resi_name');
       } else if (event === 'comname') {
         this.addres_json.slip_community_name = this.slip_community_name;
         const obj = {
           slip_community_name: ''
         };
         obj.slip_community_name = this.slip_community_name;
         const url = '24973a36-5b26-470a-a118-370c0b5c1a3f';
         this.thinkaddres(obj, url, 'slip_community_name');
       }
    }, 1000);
  }
  // 查询功能 联想获取各个数据
  thinkaddres(e: any , url: any , name: any) {
    this.thinkData = [];
    setTimeout(() => {
      this.httpService.getData( e ,
        true, 'execute', url , 'sprite')
        .subscribe(
          data => {
            if (data && data.status > 0) {
              this.thinkData = [];
              const Data = this.is_data_root(data);
              for (const v of Data) {
                const obj = {
                  name: '',
                  id: ''
                };
                obj.name = v[name];
                obj.id = name;
                this.thinkData.push(obj);
              }
              if (name === 'street_name') {
                this.is_street_haveThink = true;
              } else if (name === 'addr_desc') {
                this.is_desc_haveThink = true;
              } else if (name === 'resi_name') {
                this.is_res_haveThink = true;
              } else if (name === 'slip_community_name') {
                this.is_com_haveThink = true;
              }
            }
          },
          error => {
            toError(error);
          }
      );
    }, 1);
  }
  thinkclickaddrs(item: any) {
    if (item && item.id && item.id === 'street_name') {
      this.street_name = item.name;
      this.addres_json.street_name = item.name;
      this.is_street_haveThink = false;
    }
    if (item && item.id && item.id === 'addr_desc') {
      this.addres_desc = item.name;
      this.addres_json.addr_desc = item.name;
      this.is_desc_haveThink = false;
    }
    if (item && item.id && item.id === 'resi_name') {
      this.resi_name = item.name;
      this.addres_json.resi_name = item.name;
      this.is_res_haveThink = false;
    }
    if (item && item.id && item.id === 'slip_community_name') {
      this.slip_community_name = item.name;
      this.addres_json.slip_community_name = item.name;
      this.is_com_haveThink = false;
    }
    // this.addres_json.street_name
  }
  changeLogSelect(event: any) {
    this.log_json.op_type = event;
  }
  //  日志查询功能
  logselectquery() {
    this.log_json.start = 0;
    this.httpService.getData(this.log_json ,
      true, 'etl', 'queryLogList' , 'sprite')
      .subscribe(
      data => {
        if ( (data as any).data && data.status > 0 ) {
          const body = {data: (data as any), queryCriteria: this.log_json};
          this.queryStreet.emit(body);
        }
      },
      error => {
       toError(error);
      }
    );
  }
  // 操作员查询
  Opertorquery() {
    this.opertor_json.start = 0;
    if (this.opertor_json.company_id === -1 || this.opertor_json.company_id === 0 ) {
      this.opertor_json.company_id = null;
    }
    if (this.opertor_json.user_station_id === -1 || this.opertor_json.user_station_id === 0) {
      this.opertor_json.user_station_id = null;
    }
    this.httpService.getData(this.opertor_json ,
      true, 'etl', 'queryUserList' , 'sprite')
      .subscribe(
      data => {
        if ( (data as any).data && data.status > 0 ) {
          const body = {data: (data as any), queryCriteria: this.opertor_json};
          this.queryStreet.emit(body);
        }
      },
      error => {
       toError(error);
      }
    );
  }
  query() {
    this.select_json.slipCommunity.start = 0;
    this.addres_json.start = 0;
    this.select_json.community.start = 0;
    this.select_json.resicommunity.start = 0;
    this.select_json.streetManage.start = 0 ;
    this.is_have_think = false;
    if ( this.interface_id && this.interface_id.interface && this.interface_id.interface.queryName.addupdata ) {
      if (this.interface_id.interface && this.interface_id.interface.queryType) {
        this.queryType = 'etl';
      }
      // 地址更新 查询
      this.httpService.getData(this.addres_json,
        true, this.queryType, this.interface_id.interface.query , 'sprite')
        .subscribe(
        data => {
          if ( (data as any).data && data.status > 0 ) {
            const body = {data: (data as any), queryCriteria: this.addres_json};
            this.queryStreet.emit(body);
          }
        },
        error => {
         toError(error);
        }
      );
    } else {
        this.select_json[this.interface_id.interface.queryName.selectName][this.interface_id.interface.queryName.name] = this.inputValue_think;
        if (this.interface_id.interface && this.interface_id.interface.queryType) {
          this.queryType = 'etl';
        }
        // 其他查询功能
        this.httpService.getData(this.select_json[this.interface_id.interface.queryName.selectName],
          true, this.queryType, this.interface_id.interface.query , 'sprite')
          .subscribe(
          data => {
            if ( (data as any).data && data.status > 0 ) {
              const body = {data: (data as any), queryCriteria: this.select_json[this.interface_id.interface.queryName.selectName]};
              this.queryStreet.emit(body);
            }
          },
          error => {
           toError(error);
          }
        );
    }


  }
  // 控制联想输入框的 显隐
  @ViewChildren('smx-gh-thinkspan') unclick: QueryList<ElementRef>;
  @HostListener('document:click', ['$event']) bodyClick(e) {
    if (getTrigger(this.unclick, 'smx-gh-thinkspan')) {
      this.is_have_think = false;
      this.is_street_haveThink = false;
      this.is_desc_haveThink = false;
      this.is_com_haveThink = false;
      this.is_res_haveThink = false;
    }
    function getTrigger(queryList, className?) {
      let flag = true;
      (<HTMLElement[]>e.path).forEach(i => {
        flag && queryList.forEach(el => {
          i.isEqualNode && i.isEqualNode(el.nativeElement) && (flag = false);
        })
        flag && i.className && i.className.indexOf && i.className.indexOf(className) > -1 && (flag = false);
      })
      return flag;
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
dateChangestart(event: any) {
  // console.log(event);
}
dateChangeend(event: any) {
  // console.log(event);
  // console.log(dateFormat(new Date(event) , 'yyyy-MM-dd' ));
  // console.log(this.log_json);
}



}
