import { Component, OnInit, Input, Output, EventEmitter, ViewChildren, ViewChild, QueryList, AfterViewInit, ElementRef, Renderer2, HostListener } from '@angular/core';
import {SmxActiveModal} from '../../../smx-component/smx-modal/smx-modal.module';
import {SmxModal} from '../../../smx-component/smx-modal/smx-modal.module';
import { deepCopy } from 'src/app/smx-component/smx-util';
import {ModalComponent} from '../modal/modal.component';
import {HttpService} from '../../../s-service/http.service';
import {toError} from 'src/app/smx-component/smx.module';
import {ToastConfig, ToastType, ToastService} from '../../../smx-unit/smx-unit.module';
import { toWgs84 } from '@turf/turf';
import { isNumber } from 'util';

@Component({
  selector: 'content-modal',
  templateUrl: './content-modal.component.html',
  styleUrls: ['./content-modal.component.scss']
})
export class ContentModalComponent implements OnInit {
  // value = 1565924558;
  @Input() selectData: any;  // 下拉框数据
  @Input() data: any; // 模态框回显数据的参数
  @Input() appdate: any; // 日期数据
  @Input() isEdit: any; // 是否可以编辑 状态
  @Input() type: any; // 模态框状态
  @Input() interface_id: any; // 入口 所有信息
  @Input() addres_updata: any;
  @Input() addresGat: any;
  @Input() radio: any; // 门址对象数据
  fileArr: any;
  data_add: any;
  tel_isExist = true;
  police_tel_isExist = true;
  is_no_sursubmit = false;
  moreaddr_isEdit = true;
  layerIsZero = false;
  address_updates_time: any;
  selectValue: any = [];
  selectDataAdmin: any = []; // 行政区划的下拉框
  selectDataCanton: any = []; // 业务管理区划的下拉框
  selectDataUser: any = []; // 用户站下拉框
  selectDataStreet: any = []; // 街道下拉框
  inputValue_think = ''; // 地址更新 联想输入框输入的值
  think_isHave = false; // 联想输入框是否显隐
  addrthink_isHave = false;
  addrthink_isHave_res = false;
  gates_addres_desc_boolean = false;
  thinkData = []; // 联想输入框数据
  is_admin_true = false;
  is_desc_true = false;
  thinkDatauser = [];
  all_data = true;
  isOpen = false;
  fenpei_lianxiang: any;
  isUpdate = true;
  is_opertionboolean = false;
  selectUser_data = false;
  addres_istrue: any = true; // 地址更新确定按钮 是否可以用
  addr_isEdit: any = false;
  company_no = false;
  company_name = false;
  company = true;
  user_station = false;
  user_station_com = false;
  fenpei = false;
  uploadPath: any; // 批量导入传给后台选择文件的路径
  fileStatus = ''; // 批量导入中文件上传的状态
  userStation_think = '';
  xiaoqu = ''; // 小区不存在的验证信息
  shequ = ''; // 社区不存在的验证信息
  isXiaoSheQu: any; // 小区社区不存在状态码，控制提交按钮不为true
  doorLog: any;
  select_json = {
    streetManage_think: {
      street_name: ''
    },
    // 社区
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
  removeInData = {
    address_id: null,
    gate_site_id_array : []
  };
  upStatus = false;

  companyArray = [];
  constructor(
    public activeModal: SmxActiveModal, private ngbModalService: SmxModal, public httpService: HttpService, public toastService: ToastService,
  ) { }
  is_non_select = [
    {label: '是' , value: 1},
    {label: '否' , value: -1}
  ];
  is_main_compang = [
    {label: '是' , value: -1},
    {label: '否' , value: 1}
  ];
  // 地址更新 地址是否被启用 下拉框
  add_is_used = [
    {label: '启用' , value: 1},
    {label: '停用' , value: -1}
  ];
  addarch_form = [
    {label: '楼房' , value: 1},
    {label: '平房' , value: 2}
  ];
  door_is_used = [
    {label: '使用', value: 1},
    {label: '未使用', value: -1}
  ];
  opertionUser = [
    {label: '' , value: null}
  ];
  // 地址更新 行政区划 业务管理区划 用户站 街道 下拉框数组
  add_adminArea = [];
  add_canton = [];
  add_user_station = [];
  add_street = [];
  // 地址更新
  small_slip = [];
  // 批量添加门址 存储的数据
  addresUpdata = {
    first_desc: '',
    first_num: null,
    end_num: null,
    mid_link: '-',
    Layer_num: null,
    room_num: null,
    addresgates : [],
  };
  ispreviewTbale: any = false; // 是否显示预览批量门址
  tableStyle: any = false;
  rescom_type: any = false;
  reslice_type: any = false;
  gatesArray: any = []; // 保存批量门址
  gatesUpdate: any = []; // 门址修改，每条地址对应的所有单元门址
  saveDoorIds: any = []; // 选择门址的时候，存储id
  isAllChecked: any;

  portNum: any; // 端口数，绑定在批量添加端口的输入框
  is_no_gatesUpdate = false;
  is_no_gatesAmdin = false;
  is_no_gatesAddres = false;
  delBtn = true;
  allDoorData: any;
  gatesAdminDesc = {
    admin_area_id: null,
    addr_desc: ''
  };
  gridHeader = [{name: '门址描述', id: 'gate_desc'}, {name: '端口数', id: 'port_count'}, {name: '操作', id: 'operation'}];
  AddressDet = [
    {name: 'arch_form'},
    {name: 'addr_key'},
    {name: 'canton_name'},
    {name: 'canton_id'},
    {name: 'admin_area_name'},
    {name: 'admin_area_id'},
    {name: 'street_name'},
    {name: 'street_id'},
    {name: 'link_man'},
    {name: 'tel'},
    {name: 'resicommunity_id'},
    {name: 'resi_link_man'},
    {name: 'resi_tel'},
    {name: 'user_station_id'},
    {name: 'user_station_name'},
    {name: 'community_id'},
    {name: 'community_name'},
    {name: 'commu_link_man'},
    {name: 'commu_tel'},
    {name: 'slip_community_id'},
    {name: 'slip_community_name'},
    {name: 'slip_link_man'},
    {name: 'slip_tel'},
    {name: 'lt_addr_all'},
    {name: 'resi_name'},
    {name: 'gates'},
    {name: 'addr_desc'},
    {name: 'office_addr'}
  ];
  AddressDetails = {
    arch_form: '',
    addr_key: '',
    addr_desc: '',
    canton_name: '',
    canton_id: '',
    admin_area_name: '',
    admin_area_id: '',
    street_name: '',
    street_id: '',
    link_man: '',
    tel: '',
    resicommunity_id: '',
    resi_link_man: '',
    resi_tel: '',
    user_station_id: '',
    user_station_name: '',
    community_id: '',
    community_name: '',
    commu_link_man: '',
    commu_tel: '',
    slip_community_id: '',
    slip_community_name: '',
    slip_link_man: '',
    slip_tel: '',
    lt_addr_all: '',
    resi_name: '',
    office_addr: '',
    gates: []
  };

  branchOffice = []; // 存储分公司列表
  roleList = []; // 存储角色列表
  roleList_oper = [];
  list = [];
  List = [];
  array: any;

  submitBranchOffice: any; // 存储右边的分公司作为参数提交后台保存
  submitModule: any; // 存储右边的模块作为参数提交后台保存

  isHave: any; // 门址修改和添加时，门址描述不能为空


  ngOnInit() {
    if (this.data) {
      if (this.data.unitDoorData && this.data.unitDoorData.length > 0) {
        this.gatesUpdate = this.data.unitDoorData;
        for (let i = 0; i < this.gatesUpdate.length; i++) {
          this.gatesUpdate[i]['checked'] = false;
        }
        // 存储编号、地址描述、建筑形式
        this.allDoorData = {address_id: this.gatesUpdate[0].address_id, addr_desc: this.gatesUpdate[0].addr_desc, arch_form: this.gatesUpdate[0].arch_form};
        // 如果地址下没有门址，不显示
        if (this.gatesUpdate.length === 1) {
          if ( !this.gatesUpdate[0].gate_site_id && !this.gatesUpdate[0].gate_desc) {
            this.gatesUpdate = [];
          }
        }
      }

    }
    // 用户站维护，需要用到分公司
    if (this.type.one === '29-1') {
      this.httpService.getData({},
        true, 'execute', '7bb1b18d-42a0-4d66-9859-6002d8f4555d' , 'sprite')
        .subscribe(
        data => {
          if (data.status > 0 && (data as any).data) {
            const Data = this.is_data_root(data);
            for (let i = 0; i < Data.length; i++) {
              this.companyArray.push({label: Data[i].company_name, value: Data[i].company_id});
            }
          }
        },
        error => {
          // console.log(error);
        }
      );
    }

    if (this.isEdit) {
      this.is_no_sursubmit = false;
      this.addres_istrue = false;
      this.company_name = true;
      this.company_no = true;
      this.rescom_type = false;
      this.reslice_type = false;
      this.user_station = false;
      this.user_station_com = false;
    } else {
      this.is_no_sursubmit = true;
      this.addres_istrue = true;
      this.company_name = false;
      this.company_no = false;
      this.rescom_type = true;
      this.reslice_type = true;
      this.user_station = true;
      this.user_station_com = true;
      this.is_opertionboolean = true;
    }
    // resicommunity_type_id 请求小区类型
    if (this.interface_id && this.interface_id.restypyselect === 'resicommunity_type_id' ) {
      this.httpService.getData({},
        true, 'execute', 'b9c23c06-45be-4533-ba02-1589d47f9d94' , 'sprite')
        .subscribe(
        data => {
          if (data.status > 0 && (data as any).data) {
            let data_res;
            if ((data as any).data.root) {
              data_res = (data as any).data.root;
            } else {
              data_res = (data as any).data;
            }
            for (const v of data_res) {
              const obj_slip = {
                label: '',
                value: ''
              };
              obj_slip.label = v.type_name;
              obj_slip.value = v.resicommunity_type_id;
              this.small_slip.push(obj_slip);
            }
          }
        },
        error => {
          // console.log(error);
        }
      );
    }
    this.data = deepCopy(this.data);
    if (this.selectData) {
      if (this.interface_id) {
        let Data;
        if ( (this.selectData as any) && (this.selectData as any).root) {
          Data = (this.selectData as any).root;
        } else {
          Data = (this.selectData as any);
        }
        for ( const v of Data) {
           const obj = {
            label: '',
            value: 1
           };
           obj.label = v[this.interface_id.interface.queryName.label];
           obj.value = v[this.interface_id.interface.queryName.value];
           this.selectValue.push(obj);
        }
      }
    }
    // 地址更新中的四个下拉框数据请求
    if (this.interface_id && this.interface_id.addr_update) {
      this.addUpdataFourSelect();
    }
    if (this.interface_id && this.interface_id.addr_update && this.addres_updata) {
      this.updataAddres(this.data);
    }
    if (this.type && this.type.two === '19-2' && !this.addres_updata) {
      this.addresRadio('no');
    }
    if ( this.data && this.data.isuserStation ) {
      this.userStation();
    }
    if (this.data && this.data.desc && this.type === '19-10') {
       this.addresDesc(this.addresGat);
    }
    if (this.data && this.data.gate_site_id && this.type === '19-11') {
      this.data.is_used = this.data.is_used === 1 ? '已使用' : '未使用';
    }
    if (this.type && this.type === '19-9') {
      this.addUpdataFourSelect();
    }
    if (this.type && this.type.two === '39-2') {
      this.roleSelectoption_oper();
      this.optionCompany();
    }
    if (this.type === 20) {
      this.opertionAndUser();
    }
    if (this.type === 21) {
      // 获取角色列表
       /*  this.httpService.getData({},
        true, 'execute', '28af12d0-64df-4373-846c-062c9993374c', 'sprite')
        .subscribe(
        data => {
          const Data = this.is_data_root(data);
          for (let i = 0; i < Data.length; i++) {
            const body = {};
            body['label'] = Data[i].role_name;
            body['value'] = Data[i].role_id;
            this.roleList.push(body);
          }
        },
        error => {
         toError(error);
        }
      ); */
      this.roleSelectoption();
    }


    if (this.type === 22) {
      // 获取分公司列表
        /* this.httpService.getData({},
        true, 'execute', '7bb1b18d-42a0-4d66-9859-6002d8f4555d', 'sprite')
        .subscribe(
        data => {
          const Data = this.is_data_root(data);
          for (let i = 0; i < Data.length; i++) {
            const body = {};
            body['label'] = Data[i].company_name;
            body['value'] = Data[i].company_id;
            this.branchOffice.push(body);
          }
        },
        error => {
         toError(error);
        }
      ); */
      this.optionCompany();
    }
  }
  // 公司列表
  optionCompany() {
    this.httpService.getData({},
      true, 'execute', '7bb1b18d-42a0-4d66-9859-6002d8f4555d', 'sprite')
      .subscribe(
      data => {
        const Data = this.is_data_root(data);
        for (let i = 0; i < Data.length; i++) {
          const body = {};
          body['label'] = Data[i].company_name;
          body['value'] = Data[i].company_id;
          this.branchOffice.push(body);
        }
      },
      error => {
       toError(error);
      }
    );
  }
  // 角色列表
  roleSelectoption() {
    this.httpService.getData({},
      true, 'execute', '28af12d0-64df-4373-846c-062c9993374c', 'sprite')
      .subscribe(
      data => {
        const Data = this.is_data_root(data);
        for (let i = 0; i < Data.length; i++) {
          const body = {};
          body['label'] = Data[i].role_name;
          body['value'] = Data[i].role_id;
          this.roleList.push(body);
        }
      },
      error => {
       toError(error);
      }
    );
  }
  // 操作员根据 用户 进行的 角色筛选
  roleSelectoption_oper() {
    this.httpService.getData({},
      true, 'etl', 'queryRolesByUserRole', 'sprite')
      .subscribe(
      data => {
        const Data = (data as any).data.roles;
        for (let i = 0; i < Data.length; i++) {
          const body = {};
          body['label'] = Data[i].role_name;
          body['value'] = Data[i].role_id;
          this.roleList_oper.push(body);
        }
      },
      error => {
       toError(error);
      }
    );
  }
  // 分公司与用户站  角色和模块 操作员与用户站 wbwb
  getUserStation(e: any) {
    this.list = [];
    this.submitBranchOffice = [];
    this.submitModule = [];
    if (this.type === 20) {
      const obj = {
        userid: null
      };
      obj.userid = e;
      this.httpService.getData(obj,
        true, 'etl', 'queryUserStationByUser', 'sprite')
        .subscribe(
        data => {
          if (data && data.status > 0) {
            this.submitModule = data.data;
            for (let i = 0; i < data.data.list.length; i++) {
              const body = {};
              body['key'] = data.data.list[i].user_station_id;
              body['title'] = data.data.list[i].user_station_name;
              body['direction'] = data.data.list[i].direction;
              this.list.push(body);
            }
            // 把筛选出的信息存储到List里，绑定到穿梭框组件
            this.List = this.list;
          }
        },
        error => {
         toError(error);
        }
      );
    }
    if (this.type === 21) {
      const roleId = Number(e.target.value);
      this.httpService.getData({role_id: roleId},
        true, 'etl', 'queryModuleByRole', 'sprite')
        .subscribe(
        data => {
          if (data && data.status > 0) {
            this.submitModule = data.data;
            for (let i = 0; i < data.data.list.length; i++) {
              const body = {};
              body['key'] = data.data.list[i].module_id;
              body['title'] = data.data.list[i].module_name;
              body['direction'] = data.data.list[i].direction;
              this.list.push(body);
            }
            // 把筛选出的信息存储到List里，绑定到穿梭框组件
            this.List = this.list;
          }
        },
        error => {
         toError(error);
        }
      );
    }
    if (this.type === 22) {
      const companyId = Number(e.target.value);
      this.httpService.getData({company_id: companyId},
        true, 'etl', 'queryStationByCID', 'sprite')
        .subscribe(
        data => {
          if (data && data.status > 0) {
            this.submitBranchOffice = data.data;
            for (let i = 0; i < data.data.list.length; i++) {
              const body = {};
              body['key'] = data.data.list[i].user_station_id;
              body['title'] = data.data.list[i].user_station_name;
              body['direction'] = data.data.list[i].direction;
              this.list.push(body);
            }
            // 把筛选出的信息存储到List里，绑定到穿梭框组件
            this.List = this.list;
          }
        },
        error => {
         toError(error);
        }
      );
    }
  }
  // 操作员与用户站的提交
  submitOpertionUser() {
    const exitarry = [];
    for (const v of this.List) {
      if (v.direction === 'right') {
        const obj = {
          user_station_id: null,
          user_station_name: '',
          direction: ''
        };
        obj.user_station_id = v.key;
        obj.user_station_name = v.title;
        obj.direction = v.direction;
        exitarry.push(obj);
      }
    }
    this.httpService.getData({userid: this.submitModule.userid, exist: exitarry},
      true, 'etl', 'updateUserStationByUser', '')
      .subscribe(
      data => {
       if (data && data.status > 0) {
            const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '用户站分配成功!', 2000);
            this.toastService.toast(toastCfg);
            this.activeModal.close();
       }
      },
      error => {
       toError(error);
      }
    );
  }
  // 分公司和用户站的提交
  submitComUser() {
    // updateStationCom

    for (let j = 0; j < this.submitBranchOffice.list.length; j++) {
      for (let i = 0; i < this.list.length; i++) {
        if (this.list[i].key === this.submitBranchOffice.list[j].user_station_id && this.list[i].direction === 'right') {
          this.submitBranchOffice.list[j].direction = 'right';
        }
        if (this.list[i].key === this.submitBranchOffice.list[j].user_station_id && this.list[i].direction === 'left') {
          this.submitBranchOffice.list[j].direction = 'left';
        }
      }
    }
    this.array = [];
    for (let i = 0; i < this.submitBranchOffice.list.length; i++) {
      if (this.submitBranchOffice.list[i].direction === 'right') {
        this.array.push(this.submitBranchOffice.list[i]);
      }
    }
    this.httpService.getData({company_id: this.submitBranchOffice.company_id, exist: this.array},
      true, 'etl', 'updateStationCom', '')
      .subscribe(
      data => {
       if (data && data.status > 0) {
            this.activeModal.close();
            const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '用户站分配成功!', 2000);
            this.toastService.toast(toastCfg);
       }
      },
      error => {
       toError(error);
      }
    );
  }

  // 角色和模块关系提交
  submitRoleModule() {
    for (let j = 0; j < this.submitModule.list.length; j++) {
      for (let i = 0; i < this.list.length; i++) {
        if (this.list[i].key === this.submitModule.list[j].module_id && this.list[i].direction === 'right') {
          this.submitModule.list[j].direction = 'right';
        }
        if (this.list[i].key === this.submitModule.list[j].module_id && this.list[i].direction === 'left') {
          this.submitModule.list[j].direction = 'left';
        }
      }
    }
    this.array = [];
    for (let i = 0; i < this.submitModule.list.length; i++) {
      if (this.submitModule.list[i].direction === 'right') {
        this.array.push(this.submitModule.list[i]);
      }
    }
    this.httpService.getData( {role_id: this.submitModule.role_id, exist: this.array} ,
      true, 'etl' , 'updateModuleByRole' , '')
      .subscribe(
        data => {
          if (data && data.status > 0) {
            this.activeModal.close();
            const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '模块分配成功!', 2000);
            this.toastService.toast(toastCfg);
          }
        },
        error => {
          toError(error);
        }
    );
  }

  // 获取地址详情
  addresDesc(e: any) {
    const obj = {
      address_id: null,
    };
    obj.address_id = e.address_id;
    this.httpService.getData( obj ,
      true, 'etl' , 'queryAddrGateDetail', 'sprite')
      .subscribe(
        datas => {
          if ( datas.status > 0 && datas ) {
            const Datas = this.is_data_root(datas);
            for (const ad of this.AddressDet) {
              if (Datas[ad.name] !== undefined) {
                if (ad.name === 'arch_form') {
                  this.AddressDetails[ad.name] = Datas[ad.name] === 1 ? '楼房' : '平房';
                } else {
                  this.AddressDetails[ad.name] = Datas[ad.name];
                }
              }
            }
          }
          // TODO
        },
    error => {
      console.log(error);
    }
  );
  }
  // 分配用户站  获取用户站信息
  userStation() {
          this.httpService.getData( {} ,
          true, 'execute' , 'c9353003-285c-4d2a-bfc9-d37ebd84990f', 'sprite')
          .subscribe(
            datas => {
              if ( datas && datas.status > 0 ) {
                this.thinkData = [];
                const Data = this.is_data_root(datas);
                for (const v of Data) {
                  const obj = {
                    name: '',
                    id: null
                  };
                  obj.name = v.user_station_name;
                  obj.id = v.user_station_id;
                  this.thinkData.push(obj);
                }
              }
              // TODO
            },
        error => {
          console.log(error);
        }
      );
  }
  // 用户站下拉框
  userStationclick() {
    this.isOpen = !this.isOpen;
    this.think_isHave = true;
    this.all_data = true;
    this.selectUser_data = false;
  }
  InputUserStation() {
    this.thinkDatauser = [];
    if (this.thinkData && this.thinkData.length > 0) {
      for ( const v of this.thinkData) {
        if (v.name.indexOf(this.userStation_think) !== -1) {
          this.thinkDatauser.push(v);
        }
       /*  if (v.name === this.userStation_think) {
          this.data.needId = v.id;
          this.fenpei = true;
          return;
        } else {
          this.fenpei = false;
        } */
      }
      setTimeout(() => {
        this.think_isHave = true;
        this.all_data = false;
        this.selectUser_data = true;
      }, 100);
    }

  }
  // 地址更新 修改时候回显回去地址详细数据
  updataAddres(e: any) {
    if ( e && e.address_id ) {
        this.httpService.getData( { 'address_id' : e.address_id} ,
            true, 'execute' , 'bb9f3f9a-a99c-4af6-b659-0e46abb1a4a9', 'sprite')
            .subscribe(
          datas => {
            if ( datas.status > 0 && (datas as any).data ) {
              if ( (datas as any).data.root ) {
                this.data = (datas as any).data.root[0];
              } else {
                this.data = (datas as any).data[0];
              }
              if (this.data.resicommunity_id === '') {
                this.data.resicommunity_id = null;
              }
              if (this.data.community_id === '') {
                this.data.community_id = null;
              }
              if (this.data.street_id === '') {
                this.data.street_id = null;
              }
              if (this.type && this.type.two === '19-2') {
                this.addresRadio('no');
              }
            }
          },
          error => {
            console.log(error);
          }
        );
    }
  }
  // 地址更新 修改行政区划
  addresACUS(event: any , name: any) {
    if (name === 'admin_area_id') {
      this.data.admin_area_id = event;
      for ( const v of this.selectDataAdmin ) {
        if (v.value === event) {
          this.data.admin_area_name = v.label;
        }
      }
    } else if (name === 'canton_id') {
      this.data.canton_id = event;
      for ( const v of this.selectDataCanton ) {
        if (v.value === event) {
          this.data.canton_name = v.label;
        }
      }
    } else if (name === 'user_station_id') {
      this.data.user_station_id = event;
      for ( const v of this.selectDataUser ) {
        if (v.value === event) {
          this.data.user_station_name = v.label;
        }
      }
    } else if (name === 'street_id') {
      this.data.street_id = event;
    }
    this.addr_descChange();
  }
  addr_descChange() {
    if (this.data.admin_area_id !== 0 && this.data.admin_area_id !== '' &&
        this.data.canton_id !== 0 && this.data.canton_id !== '' &&
        this.data.user_station_id !== 0 && this.data.user_station_id !== '' && this.data.addr_desc !== '') {
          // this.addres_istrue = true;
          if (this.xiaoqu === '' && this.shequ === '') {
            this.addres_istrue = true;
          } else {
            this.addres_istrue = false;
          }
    } else {
      this.addres_istrue = false;
    }
  }
  // 地址添加时，需要4个下拉框，加载里面的数据
  addUpdataFourSelect() {
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
                   value: ''
                 };
               canton_obj.label = v.canton_name;
               canton_obj.value = v.canton_id;
               this.selectDataCanton.push(canton_obj);
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
               const admin_obj = {
               label: '',
               value: ''
           };
              admin_obj.label = v.admin_area_name;
              admin_obj.value = v.admin_area_id;
              this.selectDataAdmin.push(admin_obj);
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
                 const user_obj = {
                   label: '',
                   value: ''
                 };
                user_obj.label = v.user_station_name;
                user_obj.value = v.user_station_id;
                this.selectDataUser.push(user_obj);
             }
             }
         },
         error => {
          toError(error);
           }
         );
         // 街道
         this.httpService.getData( {} ,
          true, 'etl', 'queryStreetList', 'sprite')
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
                  const street_obj = {
                    label: '',
                    value: ''
                  };
                  street_obj.label = v.street_name;
                  street_obj.value = v.street_id;
                 this.selectDataStreet.push(street_obj);
              // this.add_user_station_query.push(canton_obj);
              }
              }
          },
          error => {
            toError(error);
            }
          );
   }
  // changeStreet(event: any) {
  // }
  selectFile(e: any) {
    this.fileArr = e.file;
    this.fileStatus = '文件已选择';
  }

  /* 上传文件 */
  upFile() {
    if (this.fileArr) {
        this.httpService.makeFileRequest('/upload/1.0.0/gehua/uploadFile',
        {}, this.fileArr).subscribe(
        data => {
          if ((data as any).data.result < 0) {
            const toastCfg = new ToastConfig(ToastType.ERROR, '', '操作失败，请稍后再试!', 2000);
            this.toastService.toast(toastCfg);
            this.fileStatus = '文件上传失败,' + (data as any).data.error ;
            this.isUpdate = false;
            return;
          } else {
            const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '文件上传成功!', 500);
            this.toastService.toast(toastCfg);
            this.uploadPath = (data as any).data.upload_file;
            this.fileStatus = '文件已上传';
            this.isUpdate = true;
          }
        }
      );
    } else {
      const toastCfg = new ToastConfig(ToastType.WARNING, '', '请先选择文件!', 2000);
      this.toastService.toast(toastCfg);
    }
  }
  // 行政管理区划 判空校验
  adminBlur() {
    if (this.data.admin_area_id !== 0 && this.data.admin_area_name !== '' && this.data.admin_area_id !== '' ) {
      this.is_no_sursubmit = true;
    } else {
      this.is_no_sursubmit = false;
    }
  }
  // 业务管理区划 校验
  cantonBlur() {
    if ( this.data.canton_id !== 0 && this.data.canton_id !== '' && this.data.canton_name !== '' ) {
      this.is_no_sursubmit = true;
    } else {
      this.is_no_sursubmit = false;
    }
  }
  // 街道维护 判空校验
  streetBlur() {
    if ( this.data.admin_area_id !== 0 && this.data.admin_area_id !== '' && this.data.street_name !== '' ) {
      this.is_no_sursubmit = true;
    } else {
      this.is_no_sursubmit = false;
    }
  }
  // 社区维护 判空校验
  communityBlur() {
    if ( this.data.admin_area_id !== 0 && this.data.admin_area_id !== '' && this.data.community_name !== '' ) {
      this.is_no_sursubmit = true;
    } else {
      this.is_no_sursubmit = false;
    }
  }
  // 小区维护 判空校验
  resiBlur() {
    if ( this.data.admin_area_id !== 0 && this.data.admin_area_id !== '' && this.data.resi_name !== '' ) {
      this.is_no_sursubmit = true;
    } else {
      this.is_no_sursubmit = false;
    }
  }
  // 片区维护 判空校验
  slip_communityBlur() {
    if (this.data.slip_community_name !== '' && this.data.link_man !== '' ) {
      this.is_no_sursubmit = true;
    } else {
      this.is_no_sursubmit = false;
    }
  }
  // 电话校验
  telMatch() {
    if (this.data.tel || this.data.tel === '' ) {
      if (this.data.tel === '') {
        this.tel_isExist = true;
      } else {
        if (  this.data.tel.match(/^[0-9][0-9]\d{5}$/) !== null ||
              this.data.tel.match(/^[0-9][0-9]\d{6}$/) !== null ||
              this.data.tel.match(/^[0-9][0-9]\d{7}$/) !== null ||
              this.data.tel.match(/^[0-9][0-9]\d{8}$/) !== null ||
              this.data.tel.match(/^[0-9][0-9]\d{9}$/) !== null) {
          this.tel_isExist = true;
        } else {
          this.tel_isExist = false;
        }
      }
    }
    if (this.data.police_tel || this.data.police_tel === '') {
      if (this.data.police_tel === '') {
        this.police_tel_isExist = true;
      }else {
          if (  this.data.police_tel.match(/^[0-9][0-9]\d{5}$/) !== null ||
                this.data.police_tel.match(/^[0-9][0-9]\d{6}$/) !== null ||
                this.data.police_tel.match(/^[0-9][0-9]\d{7}$/) !== null ||
                this.data.police_tel.match(/^[0-9][0-9]\d{8}$/) !== null ||
                this.data.police_tel.match(/^[0-9][0-9]\d{9}$/) !== null) {
            this.police_tel_isExist = true;
          } else {
            this.police_tel_isExist = false;
          }
        }
      }
  }

  // 地址更新 radio事件
  addresRadio(e: any) {
    if (e === 'one') {
        this.data.addresgates = [{
          gate_desc: '.',
          port_count: null,
          position_info: '',
          is_used: 1
        }];
        const addresUpdata = {
          gate_desc: '.',
          port_count: null,
          position_info: '',
          is_used: 1
        };
        const modal = this.ngbModalService.open(ModalComponent, {centered: true, backdrop: 'static'});
        modal.componentInstance.title = {name: '单个添加门址'};
        modal.componentInstance.radio = addresUpdata;
        modal.componentInstance.type = {addresOne: '25-1', addresTwo: '26-1' };
        modal.result.then((result) => {
          this.data.isAddres = true;
          this.data.isOne = true;
          this.data.addresgates = [];
          this.data.addresgates.push(result);
          // 添加数据
        }, (reason) => {
        });
    }
    if (e === 'more') {
        this.data.addresgates = [{
          gate_desc: '.',
          port_count: null,
          position_info: '',
          is_used: 1
        }];
        const modal = this.ngbModalService.open(ModalComponent, {centered: true, backdrop: 'static'});
        modal.componentInstance.title = {name: '批量添加门址'};
        modal.componentInstance.radio = this.addresUpdata;
        modal.componentInstance.type = {addresOne: '26-1', addresTwo: '26-2' };
        modal.result.then((result) => {
          this.data.isAddres = true;
          this.data.isTwo = result;
          this.data.addresgates = result.addresgates;

          // 添加数据
        }, (reason) => {
        });
    }
    if (e === 'no') {
      if (!this.addres_updata) {
        this.data.isAddres = true;
        this.data.addresgates = [{
          gate_desc: '.',
          port_count: null,
          position_info: '',
          is_used: 1
        }];
      }
    }
  }
  gateDesc() {
    if (this.radio.gate_desc === '') {
      this.addr_isEdit = true ;
    }else {
      this.addr_isEdit = false ;
    }
  }
  gates() {
    this.GenerateGatesdata(this.radio);
  }
  // 预览批量门址
  previewGates() {
    this.ispreviewTbale = true;
    this.GenerateGatesdata(this.radio);
    if (this.gatesArray.length > 7 ) {
      this.tableStyle = true;
    }
  }
  // 批量生产门址
  GenerateGatesdata(e: any) {
    const is_have = this.is_null_zero(e);
    if (is_have && e && this.radio && this.radio.addresgates) {
      this.gatesArray = [];
      this.radio.addresgates = [];
      for (let d = 0 ; d < (e.end_num - e.first_num ) + 1 ; d++) { // 几个单元
        // 单元
        const sheet = e.first_num + d ;
        for ( let c = 1 ; c <= e.Layer_num ; c++ ) { // 有几层
          for ( let r = 1 ; r <= e.room_num ; r ++) { // 每层有几个房间
              const obj = {
                gate_desc: '',
                port_count: null,
                position_info: '',
                is_used: 1,
                is_useds: '是'
              };
              // 首描述
              const desc = e.first_desc;
              // 链接符号
              const linke = e.mid_link;
              // 房间号
              const roomnum = c + '0' + r;
              if (!this.layerIsZero) {
                obj.gate_desc = desc + sheet + linke + roomnum;
              } else {
                obj.gate_desc = desc + sheet + linke + '0' + roomnum;
              }
              this.gatesArray.push(obj);
              this.radio.addresgates.push(obj);
          }
        }
      }
    } else {
      this.gatesArray = [];
      this.radio.addresgates = [];
    }
    if ( this.radio.addresgates && this.radio.addresgates.length > 0 ) {
      this.moreaddr_isEdit = false;
    } else {
      this.moreaddr_isEdit = true;
    }
  }
  // 楼层前是否加0
  layerisHaveZero () {
    this.layerIsZero = !this.layerIsZero;
    this.GenerateGatesdata(this.radio);
  }
  // 是否符合生成批量门址的要求
  is_null_zero(event: any) {
    if (event.first_num === null || event.first_num === 0 || event.end_num === null || event.end_num === 0 ||
        event.Layer_num === null || event.Layer_num === 0 || event.room_num === null || event.room_num === 0 ||
        event.first_num > event.end_num ) {
          return false;
    } else {
          return true;
    }
  }

  // 批量导入
  upload() {
    this.upStatus = true;
    this.isUpdate = false;
    this.httpService.getData({upload_file: this.uploadPath},
      true, 'etl', 'excel2DB', 'sprite')
      .subscribe(
            data => {
            if ( (data as any).status > 0 && (data as any).data) {
              if ((data as any).data.result === 1) {
                const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '数据导入成功', 2000);
                this.toastService.toast(toastCfg);
                this.fileStatus = '数据导入成功';
                const fileNum = '批量导入(成功导入文件记录条数:' + data.data.active + '条)';
                const body = {
                  op_type: 10 ,
                  note: fileNum
                };
                this.httpService.getData(body, true, 'etl' , 'insertLog', 'data')
                .subscribe(
                  datas => {
                    this.upStatus = false;
                    this.isUpdate = true;
                  },
                  error => {
                    toError(error);
                  }
                );
              } else {
                const toastCfg = new ToastConfig(ToastType.ERROR, '', '数据导入失败 : ' + data.data.msg, 3000);
                this.toastService.toast(toastCfg);
                this.fileStatus = '数据导入失败';
              }
              // this.activeModal.close();
            }
          },
            error => {
           toError(error);
            }
      );
   }

   selectCombineId(e: any) {
    for (let i = 0; i < this.data.combineData.length; i++) {
      if (e.address_id === this.data.combineData[i].address_id) {
        this.data.combineData[i].selecType = 1;
      } else {
        this.data.combineData[i].selecType = 0;
      }

    }
   }
   // 分配小区 社区 街道 等的联想输入
   changInputValue(event: any) {
    clearInterval(this.fenpei_lianxiang);
    this.fenpei_lianxiang  = setTimeout(() => {
      if ( event === '街道' ) {
      // this.think_position = true;
        this.select_json.streetManage_think.street_name = this.inputValue_think;
        this.thinkInterface(this.select_json.streetManage_think , 'street_name' , 'street_id' , '41559c86-407d-409c-8cfa-a633ecffd189');
      } else if ( event === '小区' ) {
      // this.think_position = true;
        this.select_json.resicommunityy_think.resi_name = this.inputValue_think;
        this.thinkInterface(this.select_json.resicommunityy_think , 'resi_name' , 'resicommunity_id' , '9682a02e-c856-4ffe-9179-5be7d17c9356');
      } else if ( event === '社区' ) {
      // this.think_position = true;
        this.select_json.community_think.community_name = this.inputValue_think;
        this.thinkInterface(this.select_json.community_think , 'community_name' , 'community_id' , 'ca81ec7d-fa9f-4f0a-abcc-78f010b90b56');
      } else if ( event === '片区' ) {
      // this.think_position = false;
        this.select_json.slipCommunityy_think.slip_community_name = this.inputValue_think;
        this.thinkInterface(this.select_json.slipCommunityy_think , 'slip_community_name' , 'slip_community_id' , '24973a36-5b26-470a-a118-370c0b5c1a3f');
      }
    } , 1000);
   }
   thinkInterface(e: any , name: any , id: any , url: any) {
    setTimeout(() => {
      this.httpService.getData(e,
        true, 'execute', url, 'sprite')
        .subscribe(
        datas => {
          this.thinkData = [];
          if (datas.status > 0) {
          const Data = this.is_data_root((datas as any));

            if (Data.length > 0) {
              for ( const v of Data ) {
                const obj = {
                  name: '',
                  id: null
                };
                obj.name = v[name];
                obj.id = v[id];
                if (this.inputValue_think === v[name]) {
                  if (this.data) {
                    this.data.needId = v[id];
                    this.fenpei = true;
                  }
                } else {
                  this.fenpei = false;
                }
                this.thinkData.push(obj);
                this.think_isHave = true;
              }
            }
          }
        },
        error => {
         toError(error);
        }
      );
    }, 1);
  }
// 点击联想框中的属性
  thinkclick(item: any) {
    this.userStation_think = item.name;
    this.inputValue_think = item.name;
    this.think_isHave = false;
    if ( this.data ) {
      this.data.needId = item.id;
      this.fenpei = true;
    }
  }
  thinkclick_addrcom(item: any) {
    this.xiaoqu = '';
    this.data.resi_name = item.name;
    this.data.resicommunity_id = item.id;
    this.addrthink_isHave = false;
    this.addr_descChange();
  }
  thinkclick_addrres(item: any) {
    this.shequ = '';
    this.data.community_id = item.id;
    this.data.community_name = item.name;
    this.addrthink_isHave_res = false;
    this.addr_descChange();
  }
  // 地址更新 添加修改 联想输入 小区 社区
  resicommunityThink(name: any) {
    this.thinkData = [];
    clearInterval(this.address_updates_time);
    this.address_updates_time = setTimeout(() => {
      let url;
      let obj = {};
      if (name === 'resicommunity') {
        // 小区
        url = '9682a02e-c856-4ffe-9179-5be7d17c9356';
        obj = { resi_name: this.data.resi_name };
        this.addrthink_isHave = true;
      }
      if (name === 'community') {
        url = 'ca81ec7d-fa9f-4f0a-abcc-78f010b90b56';
        obj = { community_name: this.data.community_name };
        this.addrthink_isHave_res = true;
      }
      this.httpService.getData(obj,
        true, 'execute', url, 'sprite')
        .subscribe(
        datas => {
          this.thinkData = [];
          if ( datas && datas.status > 0) {
            const Data = this.is_data_root(datas);
            if (Data.length === 0) {
              this.addres_istrue = false;
              if (name === 'resicommunity') {
                this.xiaoqu = '该小区不存在！';
              } else {
                this.shequ = '该社区不存在！';
              }
            } else {
              if (name === 'resicommunity') {
                this.xiaoqu = '';
              } else {
                this.shequ = '';
              }
            }
            for (const v of Data) {
              const objs = {
                name: '',
                id: null,
              };
              if (name === 'resicommunity') {
                objs.id = v.resicommunity_id;
                objs.name = v.resi_name;
              } else {
                objs.name = v.community_name;
                objs.id = v.community_id;
              }
              this.thinkData.push(objs);
              if ( this.xiaoqu === '' &&  this.shequ === '' ) {
                // this.isXiaoSheQu = true;
                this.addr_descChange();
              }
            }
            if (Data.length > 0) {
              if (name === 'resicommunity') { // 小区
                for (const v of this.thinkData) {
                  if (this.data.resi_name === '') {
                    this.xiaoqu = '';
                    this.data.resicommunity_id = null;
                  } else {
                    if (v.name === this.data.resi_name) {
                      this.data.resicommunity_id = v.id;
                      this.xiaoqu = '';
                    } else {
                      this.xiaoqu = '该小区不存在！';
                    }
                  }
                }
              } else { // 社区
                for (const v of this.thinkData) {
                  if (this.data.community_name === '') {
                    this.shequ = '';
                    this.data.community_id = null;
                  } else {
                    if (v.name === this.data.community_name) {
                      this.data.community_id = v.id;
                      this.shequ = '';
                    } else {
                      this.shequ = '该社区不存在！';
                    }
                  }
                }
              }
              this.addr_descChange();
            }
          }

        },
        error => {
         toError(error);
        }
      );
    }, 1000);
  }
   // 控制联想输入框的 显隐
   @ViewChildren('smx-gh-thinkspan') unclick: QueryList<ElementRef>;
   @HostListener('document:click', ['$event']) bodyClick(e) {
     if (getTrigger(this.unclick, 'smx-gh-thinkspan')) {
       // this.think_isHave = false;
       if (this.data && this.data.isuserStation) {
          if (this.isOpen) {
            this.think_isHave = true;
          } else {
            this.think_isHave = false;
          }
          if (!this.isOpen && getTrigger(this.unclick, 'smx-gh-thinkspan')) {
            this.think_isHave = false;
          }
          this.isOpen = false;
       } else {
        this.think_isHave = false;
        this.addrthink_isHave = false;
        this.addrthink_isHave_res = false;
        this.gates_addres_desc_boolean = false;
       }
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

   /* 单个门址的详情 */
   unitDoor(e: any) {
        const obj = {
          gate_site_id: null,
        };
        obj.gate_site_id = e;
        this.httpService.getData( obj ,
          true, 'execute' , 'be52c546-bb48-4aa7-97b4-fb1a3ab31157', 'sprite')
          .subscribe(
            data => {
              let Data;
              if (data.status > 0) {
                Data = this.is_data_root(data);
              } else {
                Data = [{
                  gate_site_id: 1,
                  gate_desc: '',
                  port_count: null,
                  position_info: '',
                  is_used: -1
                }];
              }
                const modal = this.ngbModalService.open(ModalComponent, {centered: true, backdrop: 'static'});
                modal.componentInstance.title = {name: '单元门址信息'};
                modal.componentInstance.data = Data[0];
                modal.componentInstance.type = '19-11';
            },
        error => {
          console.log(error);
        }
      );
  }

   checkItem(i: any, e: any, item: any) {
    if (e.target.checked) {
      this.delBtn = false;
      this.gatesUpdate[i].checked = true;
      this.saveDoorIds.push({gate_site_id: item.gate_site_id});
    } else {
      this.gatesUpdate[i].checked = false;
      this.delBtn = true;
      this.isAllChecked = false;
      for (let j = 0; i < this.saveDoorIds.length; j++) {
        if (this.saveDoorIds[j].gate_site_id === item.gate_site_id) {
          this.saveDoorIds.splice(j, 1);
        }
      }
    }
   }
   /* 批量修改端口号 */
   batchUpdate() {
    let num = 0;

    for (let i = 0; i < this.gatesUpdate.length; i++) {
      if (this.gatesUpdate[i].checked === true) {
        num += 1;
        // this.gatesUpdate[i].port_count = this.portNum;
      }
    }

    if (num > 0) {
      const body = {
        gates: this.saveDoorIds,
        port_count: this.portNum
      };
      this.httpService.getData(body, true, 'etl', 'updateGatePorts', 'data')
      .subscribe(
        data => {
            if ((data as any).status > 0 && (data as any).data) {
              let port_num = null;
              for (let j = 0; j < this.saveDoorIds.length; j++) {
                for (let i = 0; i < this.gatesUpdate.length; i++) {
                  if (this.gatesUpdate[i].gate_site_id === this.saveDoorIds[j].gate_site_id) {
                    port_num = this.gatesUpdate[i].port_count;
                    const portData = {
                      note: '批量修改 (原) (字段名) 端口号:' + port_num + '(现) (字段名) 端口号:' + this.portNum,
                      op_type: 8
                    };
                    this.httpService.getData(portData, true, 'etl', 'insertLog', 'data')
                    .subscribe(
                      Data => {
                      },
                      error => {
                        toError(error);
                      }
                    );
                    this.gatesUpdate[i].port_count = this.portNum;
                  }
                }
              }
              const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '修改成功', 2000);
              this.toastService.toast(toastCfg);
            }
        },
        error => {
          toError(error);
        }
      );
    }
    if (num < 1) {
        const toastCfg = new ToastConfig(ToastType.WARNING, '', '请选择要修改的门址', 2000);
        this.toastService.toast(toastCfg);
        return;
    }
   }

   /* 全选 */
   checkAll(e: any) {
    if (this.gatesUpdate.length > 0) {
      if (e.target.checked) {
        this.isAllChecked = true;
        this.delBtn = false;
        for (let i = 0; i < this.gatesUpdate.length; i++) {
          this.checkItem(i, {target: {checked: true}}, this.gatesUpdate[i]);
        }
      } else {
        this.saveDoorIds = [];
        this.delBtn = true;
        this.isAllChecked = false;
        for (let i = 0; i < this.gatesUpdate.length; i++) {
          this.gatesUpdate[i].checked = false;
        }
        // this.updateIdArray = [];
        // this.removeIdArray = [];
        // this.updateBtnStatus();
      }
    }

  }

  /* 门址删除 */
  delDoorData() {
    if (this.gatesUpdate.length === 1 && !this.gatesUpdate[0].gate_site_id) {
      const toastCfg = new ToastConfig(ToastType.WARNING, '', '该门址不存在，无法进行删除！', 2000);
      this.toastService.toast(toastCfg);
      return;
    }
    if (this.saveDoorIds.length > 0) {

      const modal = this.ngbModalService.open(ModalComponent, {centered: true, backdrop: 'static'});
      modal.componentInstance.title = {name: '门址修改'};
      modal.componentInstance.type = {del: '-3'};
      modal.result.then((result) => {
        const body = {
          gates: this.saveDoorIds
        };
        this.httpService.getData(body, true, 'etl', 'delGateList', 'data')
        .subscribe(
          data => {
              if ((data as any).status > 0 && (data as any).data) {
                this.isAllChecked = false ;
                this.delBtn = true;
                for (let i = 0; i < this.gatesUpdate.length; i++) {
                  for (let j = 0; j < this.saveDoorIds.length; j++) {
                    if (this.gatesUpdate[i].gate_site_id === this.saveDoorIds[j].gate_site_id) {
                      if (this.saveDoorIds.length > 1) {
                         this.doorLog = {
                          note: '批量删除(现) (字段名) 门址描述:' + this.gatesUpdate[i].gate_desc + '(字段名) 端口号 ' + this.gatesUpdate[i].port_count,
                          op_type: 9
                        };
                      }
                      if (this.saveDoorIds.length === 1) {
                        this.doorLog = {
                          note: '门址删除(现) (字段名) 门址描述:' + this.gatesUpdate[i].gate_desc + '(字段名) 端口号 ' + this.gatesUpdate[i].port_count,
                          op_type: 6
                        };
                      }
                      this.gatesUpdate.splice(i, 1);
                      // this.func(this.doorLog);
                      // 把要删除的门址记录存储到日志
                      this.httpService.getData(this.doorLog, true, 'etl', 'insertLog', 'data')
                      .subscribe(
                        Data => {
                        },
                        error => {
                          toError(error);
                        }
                      );

                    }
                  }
                }
                const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '删除成功', 2000);
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

  // func (body: any) {
  //   this.httpService.getData(body, true, 'etl', 'insertLog', 'data')
  //   .subscribe(
  //     data => {
  //       this.func(body);
  //     },
  //     error => {
  //       toError(error);
  //     }
  //   );
  // }
  ishave(e: any) {
    if (e) {
      this.isHave = false;
    } else {
      this.isHave = true;
    }
  }
  /* 单个门址修改 */
  unitDoorInfo(item: any) {
    if (!item.gate_site_id) {
      const toastCfg = new ToastConfig(ToastType.WARNING, '', '该地址下没有门址数据，无法进行编辑！', 2000);
      this.toastService.toast(toastCfg);
      return;
    }
    const body = {
      gate_site_id: item.gate_site_id,
      gate_desc: item.gate_desc,
      is_used: item.is_used,
      port_count: item.port_count,
      position_info: item.position_info
    };
    if (body.gate_desc) {
      this.isHave = true;
    } else {
      this.isHave = false;
    }

    const modal = this.ngbModalService.open(ModalComponent, {centered: true, backdrop: 'static'});
    modal.componentInstance.title = {name: '单元门址修改'};
    modal.componentInstance.data = {unitdata: body};
    modal.componentInstance.type = '19-12';
    modal.result.then((result) => {
      const info = {
        gate_site_id: result.unitdata.gate_site_id,
        gate_desc: result.unitdata.gate_desc,
        port_count: result.unitdata.port_count,
        position_info: result.unitdata.position_info
      };
      if (info.port_count === '') {
        info.port_count = null;
      }
      this.httpService.getData(info, true, 'execute', 'c5a46d84-3753-4968-ac57-d2087e0e9ac9', 'data')
      .subscribe(
        data => {
          this.is_data_root(data);
            if ((data as any).status > 0 && (data as any).data) {
              this.delBtn = true;
              for (let i = 0; i < this.gatesUpdate.length; i++) {
                if ((data as any).data.root[0].gate_site_id === this.gatesUpdate[i].gate_site_id) {
                  const gate_desc = this.gatesUpdate[i].gate_desc; // 记录修改之前的门址描述
                  const port_count = this.gatesUpdate[i].port_count; // 记录修改之前的端口号
                  this.gatesUpdate[i].gate_desc = (data as any).data.root[0].gate_desc;
                  this.gatesUpdate[i].position_info = (data as any).data.root[0].position_info;
                  this.gatesUpdate[i].port_count = (data as any).data.root[0].port_count;

                  const updatedoor = {
                    note: '门址修改(原) (字段名) 门址描述:' + gate_desc + '(字段名) 端口号:' + port_count + '(现) (字段名) 门址描述:' + this.gatesUpdate[i].gate_desc + '(字段名) 端口号:' + this.gatesUpdate[i].port_count,
                    op_type: 5
                  };
                    // 把要修改的门址记录存储到日志
                    this.httpService.getData(updatedoor, true, 'etl', 'insertLog', 'data')
                    .subscribe(
                      Data => {
                      },
                      error => {
                        toError(error);
                      }
                    );


                }
              }
              // this.saveDoorIds = [];
              const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '修改成功', 2000);
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
  // 门址修改 行政区划
  addresChange() {
    this.is_no_gatesAmdin = true;
    this.is_no_gatesUpdate = true;
    this.getAddresId();
  }
  /* addresNewDesc() {
    if (this.gatesAdminDesc.addr_desc === '' || this.gatesAdminDesc.addr_desc === ' ') {
      this.is_no_gatesAddres = false;
    }
    this.thinkData = [];
    setTimeout(() => {
      this.httpService.getData( {addr_desc: this.gatesAdminDesc.addr_desc } ,
        true, 'execute', '6cb744f1-a40e-4c58-8478-e5f781ffaa90' , 'sprite')
        .subscribe(
          data => {
            if (data && data.status > 0) {
              this.thinkData = [];
              const Data = this.is_data_root(data);
              for (const v of Data) {
                const obj = {
                  name : ''
                };
                obj.name = v.addr_desc;
                this.thinkData.push(obj);
              }
              if (this.thinkData.length > 0) {
                this.gates_addres_desc_boolean = true;
              }
            }
          },
          error => {
            toError(error);
          }
      );
    }, 100);
  } */
  thinkclicks_addrres(item: any) {
    this.gatesAdminDesc.addr_desc = item.name;
    this.is_no_gatesAddres = true;
    this.is_no_gatesUpdate = true;
    this.gates_addres_desc_boolean = false;
    this.removeInData.address_id = item.id;
  }
  // 根据行政区划 和 地址描述 获取地址id
  getAddresId(e ?: any) {
    if ( this.gatesAdminDesc.admin_area_id !== null && this.gatesAdminDesc.addr_desc !== ''  ) {
      this.httpService.getData( this.gatesAdminDesc ,
        true, 'execute', '2c1b7b10-38db-4bbe-84d4-bd01f77e3c2c' , 'sprite')
        .subscribe(
          data => {
            if (data && data.status > 0) {
              this.thinkData = [];
              const Data = this.is_data_root(data);
              for (const v of Data) {
                const obj = {
                  name : '',
                  id: null
                };
                obj.name = v.addr_desc;
                obj.id = v.address_id;
                this.thinkData.push(obj);
              }

              if (this.thinkData.length > 0) {
                this.gates_addres_desc_boolean = true;

                // 当直接输入地址新描述的时候，也可以让门址转移按钮点击
                if (this.gatesAdminDesc.addr_desc) {
                  for (let i = 0; i < this.thinkData.length; i++) {
                    if (this.gatesAdminDesc.addr_desc === this.thinkData[i].name) {
                      this.is_no_gatesAddres = true;
                    }
                  }
                }
              }
            }
          },
          error => {
            toError(error);
          }
      );
    }
  }
  // 门址转移确认
  removeInDatesure() {
    if (this.saveDoorIds && this.saveDoorIds.length > 0 && this.removeInData.address_id !== null) {
          const modal = this.ngbModalService.open(ModalComponent, {centered: true, backdrop: 'static'});
          modal.componentInstance.title = {name: '门址转移确认'};
          modal.componentInstance.type = {del: '-2'};
          modal.result.then((result) => {
            this.removeInDate();
          }, (reason) => {
          });
    } else {
      const toastCfg = new ToastConfig(ToastType.WARNING, '', '请选择要转移的门址', 2000);
      this.toastService.toast(toastCfg);
    }
  }
  // 门址转移
  removeInDate() {
    if (this.saveDoorIds && this.saveDoorIds.length > 0 && this.removeInData.address_id !== null) {
      this.removeInData.gate_site_id_array = [];
      for (const v of this.saveDoorIds) {
          this.removeInData.gate_site_id_array.push(v.gate_site_id);
        }
        if (this.removeInData.gate_site_id_array.length > 0 ) {
          this.httpService.getData( this.removeInData ,
            true, 'etl' , 'transGate' , 'sprite')
            .subscribe(
              data => {
                if (data && data.status > 0) {
                  const Data = this.is_data_root(data);
                  for (let i = 0 ; i < this.gatesUpdate.length ; i ++) {
                    for (const v of Data) {
                      if (this.gatesUpdate[i].gate_site_id === v.gate_site_id ) {
                        this.gatesUpdate.splice( i , 1 );
                      }
                    }
                  }
                  this.delBtn = true;
                  const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '门址转移成功', 2000);
                  this.toastService.toast(toastCfg);
                }
              },
              error => {
                toError(error);
              }
          );
        }
    } else {
      const toastCfg = new ToastConfig(ToastType.WARNING, '', '请选择要转移的门址', 2000);
      this.toastService.toast(toastCfg);
    }
  }

// 分公司和用户站
  change(e: any) {
  }

  select(e: any) {
  }


  /* 第三模块 */
  // maincompany('company_name')
  // 分公司 确定状态码判断
  maincompany(event: any) {
    if ( event === 'company_no' ) {
      if ( this.data.company_no.length > 0 && this.data.company_no.length < 6 ) {
        this.company_no = false;
      } else {
        this.company_no = true;
      }
    }
    if (event === 'company_name') {
      if (this.data.company_name !== '') {
        this.company_name = false;
      }else {
        this.company_name = true;
      }
    }
    // if (!this.company_name && !this.company_no) {
    //   this.isEdit = false;
    // } else {
    //   this.isEdit = true;
    // }
    if (!this.company_name) {
      this.isEdit = false;
    } else {
      this.isEdit = true;
    }
  }
  //  小区类型 片区类型 角色管理
  res_resliceChange(event: any) {
      if (event === 'res_resli') {
          if (this.data.type_name === '') {
            this.rescom_type = false;
            this.reslice_type = false;
          } else {
            this.rescom_type = true;
            this.reslice_type = true;
          }
      }
      if (event === 'role') {
        if (this.data.role_name === '') {
          this.rescom_type = false;
        } else {
          this.rescom_type = true;
        }
      }
  }
// 用户站管理
userStationcom() {
  if (this.data.user_station_no === '' || this.data.user_station_name === '') {
    this.user_station = false;
  } else {
    this.user_station = true;
  }
}
userStationcoms() {
  this.user_station_com = true;
}
// 操作员
opertionerChange() {
  if (this.data.username === '') {
    this.is_opertionboolean = false;
  } else {
    this.is_opertionboolean = true;
  }
}
// 操作员与用户站管理
opertionAndUser() {
  this.httpService.getData({},
    true, 'etl', 'queryUserList', 'sprite')
    .subscribe(
    data => {
      this.opertionUser = [{
        label: '',
        value: ''
      }];
      const Data = this.is_data_root(data);
      for (let i = 0; i < Data.length; i++) {
        const body = {
          label: '',
          value: ''
        };
        body.label = Data[i].username;
        body.value = Data[i].userid;
        this.opertionUser.push(body);
      }
    },
    error => {
     toError(error);
    }
  );
}

}
