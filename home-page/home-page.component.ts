import { Component, OnInit , OnDestroy, ViewChild } from '@angular/core';
// import { Utils } from '../../s-service/utils';
import {ActivatedRoute, Router} from '@angular/router';
import {HttpService} from '../../s-service/http.service';
import {SmxModal} from '../../smx-component/smx-modal/smx-modal.module';
import {AppService} from '../../s-service/app.service';
import {LoginModalComponent} from '../../c-main/modal/login-modal.component';

import {Location} from '@angular/common';
import {DataStorage, LocalStorage} from '../../s-service/local.storage';
import * as jwt_decode from '@smx/smartmapx-jwt-decode';
import {ToastConfig, ToastType, ToastService} from '../../smx-unit/smx-unit.module';
import {ModalComponent} from './modal/modal.component';
import {toError} from 'src/app/smx-component/smx.module';

import * as smartmapx from '@smx/api';

import {TablegridComponent} from './table-grid/tablegrid.component';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit, OnDestroy {

  config: any[];
  map: any;
  mapObj: any;
  jwt: any;
  decodedJwt: boolean;

  queryType = 'etl';

  roleInfo: any; // 角色信息
  classModule: any[] = [];
  classModuleShow: any = {};
  classThis: string;
  userName: any;
  geoJson: any = {};
  menuIsShow: any = true;
  markCon: any;
  getDataWay: boolean;
  bounds: any;
  isLogin = {
    val: false
  };

  productId: string;
  isOpen = false;
  version: any; // 版本号
  platformType: any; // 平台类型

  loginedFlagEvent: any;
  onresizeEvent: any;
  httpEvent: any;
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
  httpLoading = false;

  titleNameAddress = [];
  titleNameCommunityOne = [];
  titleNameCommunityTwo = [];
  titleNameSystemOne = [];
  titleNameSystemTwo = [];
  // titleNameAddress = [{id: 1, name: '地址更新'}, {id: 2, name: '批量导入'}, {id: 3, name: '地理专题'}];
  // titleNameCommunityOne = [{ id: 4, name: '行政管理区划维护'}, { id: 5, name: '业务管理区划维护'}];
  // titleNameCommunityTwo = [{ id: 6, name: '街道维护'}, { id: 7, name: '小区维护'}, { id: 9, name: '片区维护'}, { id: 8, name: '社区维护'}, { id: 10, name: '小区类型维护'}, { id: 11, name: '片区类型维护'}];
  // titleNameSystemOne = [{ id: 12, name: '操作员管理'}, { id: 13, name: '操作员与用户站关系管理'}];
  // titleNameSystemTwo = [ { id: 14, name: '分公司管理'}, { id: 15, name: '分公司与用户站关系管理'}, { id: 16, name: '用户站管理'}, { id: 17, name: '角色管理'}, { id: 18, name: '角色与模块关系管理'}, { id: 19, name: '日志查询'}];
 gridHeader = {
   /* 业务区划管理 */
  businessManage: [
  {name: '编码', id: 'canton_id'},
  {name: '业务管理区划', id: 'canton_name'},
  {name: '备注', id: 'canton_desc'},
  {name: '入库日期', id: 'app_dates'}
  ],
  /* 行政区划管理 */
  adminArea: [
    {name: '编码', id: 'admin_area_id'},
    {name: '行政区划', id: 'admin_area_name'},
    {name: '边界描述', id: 'admin_area_desc'},
    {name: '入库时间', id: 'app_dates'}
  ],
  /* 街道维护 */
  streetManage: [
    {name: '街道名称', id: 'street_name'},
    {name: '行政区划', id: 'admin_area_name'},
    {name: '街道办事处', id: 'office_addr'},
    {name: '联系人', id: 'link_man'},
    {name: '电话', id: 'tel'},
    {name: '所属派出所', id: 'police_station'},
    {name: '边界描述', id: 'note'},
    {name: '入库时间', id: 'app_dates'}
  ],
  /* 社区维护 */
  community: [
    {name: '社区编号', id: 'community_id'},
    {name: '社区名称', id: 'community_name'},
    {name: '居委会', id: 'club_name'},
    {name: '片警名称', id: 'police_name'},
    {name: '片警电话', id: 'police_tel'},
    {name: '行政区划', id: 'admin_area_name'},
    {name: '入库时间', id: 'app_dates'}
  ],
  /* 片区维护 */
  slipCommunity: [
    {name: '片区名称', id: 'slip_community_name'},
    {name: '片区类型', id: 'type_name'},
    {name: '联系人', id: 'link_man'},
    {name: '电话', id: 'tel'},
    {name: '入库时间', id: 'app_dates'}
  ],
  /* 小区维护 */
  resicommunity: [
    {name: '小区名称', id: 'resi_name'},
    {name: '小区简称', id: 'resi_short_name'},
    {name: '行政区划', id: 'admin_area_name'},
    {name: '商业属性', id: 'type_name'},
    {name: '物业名称', id: 'property_name'},
    {name: '物业公司', id: 'property_company'},
    {name: '是否有小前端', id: 'is_small'},
    {name: '是否改电', id: 'is_change_ele'},
    {name: '是否签署供电协议', id: 'is_ps_pro'},
    {name: '入库时间', id: 'app_dates'}
  ],

  /* 小区类型维护 */
    resicommunityType: [
      {name: '小区类型', id: 'type_name'}
    ],

  /* 片区类型维护 */
    slipCommunityType: [
      {name: '片区类型', id: 'type_name'}
    ],

    /*地址更新*/
    addressUpdate: [
      {name: '行政管理区划', id: 'admin_area_name'},
      {name: '业务管理区划', id: 'canton_name'},
      {name: '街道', id: 'street_name'},
      {name: '小区名称', id: 'resi_name'},
      {name: '地址描述', id: 'addr_desc'},
      {name: '管理', id: 'operation'},
    ],


    /* 用户站维护 */
    userStation: [
      {name: '用户站编码', id: 'user_station_no'},
      {name: '用户站名称', id: 'user_station_name'},
      {name: '日期', id: 'app_dates'}
    ],

    /* 分公司列表 */
    branchcompany: [
      {name: '公司编号', id: 'company_no'},
      {name: '公司名称', id: 'company_name'},
      {name: '是否是总公司', id: 'is_main_companys'}
    ],
  
    /* 角色列表 */
    roleManage: [
      {name: '编号', id: 'role_id'},
      {name: '角色名称', id: 'role_name'},
      {name: '角色描述', id: 'role_desc'}
    ],
    /* 操作员维护 */
    Operatorer: [
      {name: '登录ID', id: 'userid'},
      {name: '登录名', id: 'login_name'},
      {name: '操作员姓名', id: 'username'},
      {name: '角色名', id: 'role_name'},
      {name: '所属公司', id: 'company_name'}
    ],
    /* 日志查询 */
    logselect: [
      {name: '操作类型', id: 'op_types'},
      {name: '操作员', id: 'operator_name'},
      {name: '日期', id: 'app_dates'},
      {name: '日志内容', id: 'note'}
    ]
};
/*
*title ： 二级模态框的名称
*type : one 打开二级模态框的组件标识 two 是二级模态框组件中进行过滤出对应的HTML
*select： 是查询模态框 规则如type
*field：是传入的字段英文名
*query add update del 增删查改 接口
*queryType true 为etl查询 false为execute
*queryName 为下拉框配置数据的时候用到
queryName: { label: '', value: '' , name: 'resi_name' , selectName: 'resicommunity'},
label 下拉框的组件的名字 value对应的id name是用于查询的时候其中的一个查询条件 selectName 是在行成下拉框的时候保存label和value的对象名字
* */
drawControl: any;
listener_add: any;
listener_update: any;
interface = {
  /* 业务区划管理 */
  businessManage : {
    title: { add: {name: '添加业务管理区划'}, update: {name: '修改业务管理区划'}, del: {name: '删除业务管理区划'}},
    type: { add: {one: '2-1', two: '2-2'} , update: {one: '2-1', two: '2-2'} , del : {del: '-1'} },
    select: {},
    field: {canton_id: '', canton_name: '',  canton_desc: ''},
    query : '19a4d1f7-4a3a-4e31-b184-8e3b1727afff',
    add : '82e53aaa-2f9c-4a1d-8d87-0aae5729e1d4',
    update : '30f84d5a-daf6-42a5-8240-acc624320812',
    del: 'ef6a00c7-6479-43d5-b908-989ed82b37c9',
    queryType: false,
    is_used_cant: true
  },
  /* 行政区划管理 */
  adminArea : {
    title: { add: {name: '添加行政管理区划'}, update: {name: '修改行政管理区划'}, del: {name: '删除行政管理区划'}},
    field: {admin_area_id: '', admin_area_name: '',  admin_area_desc: '', app_date: ''},
    type: { add: {one: '4-1', two: '4-2'} , update: {one: '4-1', two: '4-2'} , del : {del: '-1'} },
    select: {},
    query : '58f98e71-4810-4e6f-8c89-1c3ba86dcc5b',
    add : '5e5a9b10-17f0-4db7-8610-b3935edcecba',
    update : 'a74f35e5-f1c2-475c-a5a6-e4753498a9fe',
    del: '7483b484-c9e2-4b97-817f-69c87db72b0e',
    queryType: false,
    is_used_admin: true
  },
  /* 街道维护 */
  streetManage: {
    title: { add: {name: '添加街道'}, update: {name: '修改街道信息'}, del: {name: '删除街道信息'}},
    field: {street_name: '', admin_area_name: '',  office_addr: '', link_man: '',  tel: '', police_station: '',  note: '', admin_area_id: ''},
    type: { add: {one: '6-1', two: '6-2'} , update: {one: '6-1', two: '6-2'} , del : {del: '-1'} },
    select: {one: '6-1' , two : '6-2' , inputName: '街道名称' , slecetName: '行政区划' }, // c查询组件中对应的两个框名字
    queryName: { label: 'admin_area_name', value: 'admin_area_id' , name: 'street_name' , selectName: 'streetManage'},
    query : 'queryStreetList',
    add : 'aa661923-720e-4bfd-95bc-f2916ce055c7',
    update : '58a14357-f0ef-462b-8084-1cfa8c40ecb5',
    del : '305a23fe-e8d0-46ef-9774-4f8bb11d366f',
    queryType: true
  },

  /* 社区维护 */
  community: {
    title: { add: {name: '添加社区'}, update: {name: '修改社区信息'}, del: {name: '删除社区信息'}},
    field: {community_id: '', community_name: '',
            club_name: '', police_name: '',  police_tel: '', admin_area_name: '',  app_date: '', link_man: '', tel: '',
            admin_area_id: ''},
    type: { add: {one: '8-1', two: '8-2'} , update: {one: '8-1', two: '8-2'} , del : {del: '-1'} },
    select: {one: '6-1' , two : '6-2' , inputName: '社区名称' , slecetName: '行政区划' },
    queryName: { label: 'admin_area_name', value: 'admin_area_id' , name: 'community_name' , selectName: 'community'},
    query : 'queryCommunityList',
    add : 'bc0bccd0-cdc8-4ad9-a073-c0c369392ba3',
    update : 'e359f2fa-64ee-4fbe-ba13-72ba92ccf9be',
    del : '76068f44-5312-4bf1-88b7-03eb075fe47c',
    queryType: true
  },

  /* 小区维护 */
  resicommunity: {
    title: { add: {name: '添加小区'}, update: {name: '修改小区信息'}, del: {name: '删除小区信息'}},
    field: {resi_name: '', resi_short_name: '',
            admin_area_name: '', resi_py: '',  buss_attr: -1, property_name: '',  property_company: '',
            link_man: '', tel: '', is_small: 1, is_change_ele: 1, is_ps_pro: 1, admin_area_id: ''
            },
    type: { add: {one: '10-1', two: '10-2'} , update: {one: '10-1', two: '10-2'} , del : {del: '-1'} },
    select: {one: '6-1' , two : '6-2' , inputName: '小区名称' , slecetName: '行政区划' },
    queryName: { label: 'admin_area_name', value: 'admin_area_id' , name: 'resi_name' , selectName: 'resicommunity'},
    query : 'queryResicommunityList',
    add : 'f7e88484-bbb2-4af7-9856-db2256fdd362',
    update : '54f2bb56-b479-47fc-b17b-e092a521a75f',
    del : 'cf8c3c1f-1af1-43d0-8025-bbf658c9f732',
    queryType: true
  },
  /* 片区维护 */
  slipCommunity: {
    title: { add: {name: '添加片区区'}, update: {name: '修改片区信息'}, del: {name: '删除片区信息'}},
    field: {slip_community_name: '', type_name: '', link_man: '', tel: '', app_date: '' },
    type: { add: {one: '12-1', two: '12-2'} , update: {one: '12-1', two: '12-2'} , del : {del: '-1'} },
    select: {one: '6-1' , two : '6-3' , inputName: '片区名称' , slecetName: '片区类型' },
    queryName: { label: 'type_name', value: 'slip_community_type_id' , name: 'slip_community_name' , selectName: 'slipCommunity'},
    query : 'querySlipCommunityList',
    add : '4f2cae94-6867-4ac8-917c-0c2482c62e32',
    update : '2a05a4a3-a28b-45d5-bb91-c90c9277ede4',
    del : '3c6cee94-5398-4513-96a2-3f9111655992',
    queryType: true
  },

  /*小区类型维护 */
  resicommunityType: {
    title: { add: {name: '添加小区类型'}, update: {name: '修改小区类型信息'}, del: {name: '删除小区类型'}},
    field: {type_name: ''},
    select: {},
    type: { add: {one: '15-1', two: '15-2'} , update: {one: '15-1', two: '15-2'} , del : {del: '-1'}},
    query : 'b9c23c06-45be-4533-ba02-1589d47f9d94',
    add : 'bbdc0dce-7e2f-4d90-a53b-2b2687691fee',
    update : 'dbf78c18-b01d-4625-9dc9-95c157e5290a',
    del : '879a0518-94cc-46f2-96f7-2c03c7aa6415',
    queryType: false
  },

   /*片区类型维护 */
   slipCommunityType: {
    title: { add: {name: '添加片区类型'}, update: {name: '修改小区类型信息'}, del: {name: '删除小区类型'}},
    field: {type_name: ''},
    select: {},
    type: { add: {one: '17-1', two: '17-2'} , update: {one: '17-1', two: '17-2'} , del : {del: '-1'}},
    query : 'cc985f54-dedc-437b-8671-dc8050dec9fe',
    add : 'fd199677-6722-4de9-a184-d40c5afea87f',
    update : '065a160c-ea7d-4424-a58c-b46bbb80f04c',
    del : '3e32b2ba-6465-4513-b36e-421b4069682a',
    queryType: false
   },

   /*地址更新 */
   addressUpdate: {
     title: {add: {name: '添加地址'}, update: {name: '修改地址信息'}, del: {name: '删除地址'}, updateDoor: {name: '修改门址信息'}},
     field: {community_name: '', resi_name: '' , canton_id: '', canton_name: '', admin_area_id: '', admin_area_name: '', user_station_id: '', user_station_name: '', street_id: -1, resicommunity_id: null, community_id: null, arch_form: '', addr_key: '', addr_desc: ''},
     select: {one: '19-1'},
     queryName: {addupdata: true},
     type: {add: {one: '19-1', two: '19-2'} , update: {one: '19-1', two: '19-2'} , del : {del: '-1'}, other: {one: '19-3', two: '19-4', three: '19-5', four: '19-6', five: '19-7', six: '19-8', seven: '19-9', eight: '19-10'} },
     query: 'queryAddress',
     add: 'addAddress',
     del: 'delAddress',
     update: 'updateAddress',
     queryType: true,
     addType: true,
     delType: true,
     updataType: true
   },


   /* 用户站维护 */
   userStation: {
    title: { add: {name: '添加用户站'}, update: {name: '修改用户站信息'}, del: {name: '删除用户站'}},
    type: { add: {one: '29-1', two: '29-2'} , update: {one: '29-1', two: '29-2'} , del : {del: '-1'} },
    select: {},
    field: {user_station_no: '', community_id: '', user_station_name: ''},
    query : '2040e3cf-7b8b-440a-90bc-2547d86ee56c',
    add : '18d03c3f-2974-4439-abc3-2c075350aefd',
    update : '38e1e469-1e24-4dca-bf3a-e61e3c05ea30',
    del: 'e5cd9b55-9b61-4d27-a438-641f9fd20724',
   },
   /* 分公司列表 */
   branchcompany: {
     title: { add: {name: '添加分公司'}, update: {name: '编辑公司'}, del: {name: '删除公司'}},
      type: { add: {one: '31-1', two: '31-2'} , update: {one: '31-1', two: '31-2'} , del : {del: '-1'} },
      select: {},
      field: {company_no: '', company_name: '',  is_main_company: -1},
      query : '7bb1b18d-42a0-4d66-9859-6002d8f4555d',
      add : 'e61f7163-78ae-4e51-9ff4-b0cdf324bd12',
      update : 'be6ef16c-b724-4f75-a14f-1df5bfbb4835',
      del: 'c9ad3cf5-7652-49a0-9227-9c059ec6fa04'
   },
   /* 日志查询 */
   logselect: {
     logselect: true,
     select: {one: '32-1'},
     query: 'queryLogList',
     queryType: true
   },
   /* 操作员维护 */
   Operatorer: {
    operatorerSelect: true,
    title: {update: {name: '操作员信息修改'}},
    type: { update: {one: '39-1', two: '39-2'}},
    select: {one: '32-1'},
    query: 'queryUserList',
    update: 'updateUser',
    queryType: true,
    updataType: true
   },
   /* 角色列表 */
   roleManage: {
    title: { add: {name: '添加角色'}, update: {name: '修改角色信息'}, del: {name: '删除角色'}},
    type: { add: {one: '27-1', two: '27-2'} , update: {one: '27-1', two: '27-3'} , del : {del: '-1'} },
    select: {},
    field: {role_name: '', role_desc: ''},
    query : '28af12d0-64df-4373-846c-062c9993374c',
    add : '552b6254-027a-479e-87f7-a693d9d8285b',
    update : 'b9f0755f-06cc-480b-9171-ba41bbba0eea',
    del: 'da2c4481-c8ed-40e9-89f7-36ea7dd674c6'
   }
};

  constructor(public location: Location,
    private router: Router,
    private ngbModalService: SmxModal,
    private toastService: ToastService,
    private appService: AppService,
    public httpService: HttpService,
    private routerIonfo: ActivatedRoute,
    private ls: LocalStorage,
    private ds: DataStorage) {
       // 登录事件
    this.loginedFlagEvent = this.appService.loginedFlagEventEmitter.subscribe((value: string) => {
      if (value) {
        if (value === 'logined') {
          this.userName = this.ls.get('user_id');
          this.isLogin.val = true;
        } else if (value === 'loginout') {
          this.ls.remove('id_token');
          this.isLogin.val = false;
          this.ngbModalService.dismissAll();
        }
      }
    });


    // 屏幕缩放比例改变
    this.onresizeEvent = this.appService.onresizeEventEmitter.subscribe((value: string) => {
      this.isScale();
    });


    // http 事件
    this.httpEvent = this.appService.httpEventEmitter.subscribe((value: boolean) => {
      this.httpLoading = value;
    });
     }
  @ViewChild(TablegridComponent, {static: false}) TablegridComp: TablegridComponent;
  ngOnInit() {
    this.showLogin();
    this.isScale();
    const config = <any>this.ds.get('properties');
    this.version = config.version; // 版本号
    this.platformType = config.type; // 平台类型
    // 获取配置
    // this.getScreenConfig();
      this.getMap();


      // 根据用户信息获取用户角色列表
      this.httpService.getData({}, true, 'etl', 'queryRoleByUser', '')
    .subscribe(data => {
        if ((data as any).data && (data as any).data.result === 1) {
          const array = (data as any).data.roles;
          for (let i = 0; i < array.lentgh; i++) {
            for (let j = 1; j < array.length - 1; j++) {
              if (array[j].role_id > array[j + 1].role_id) {
                const temp = array[j + 1];
                array[j + 1] = array[j];
                array[j] = temp;
              }
            }
          }
          this.roleInfo = array[0].role_name;
          this.loadRoleModule( this.menuIsShow);
        }
      },
      error => {
        toError(error);
      }
    );
  }
  getMap() {
    const options = ({
      container: 'mapId',
      mapId: 'map_id_1',
    } as any);
    this.mapObj = new smartmapx.Map(options);
    this.mapObj .setZoom(8);
    this.mapObj .setCenter([116.408146, 39.907430]);
    this.mapObj .setMaxBounds([ [58.3459264919145, 15.999999999983714], [168, 53.867625235604805]]);
    // 加载显示点的地图
    this.mapObj.on('load', () => {
      this.mapObj.addSource('layerSource', {
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
        'id': 'layer_gehua',
        'type': 'symbol',
        'source': 'layerSource',
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
    });
  }

  // 显示登录信息
  showLogin() {
    this.jwt = this.ls.get('id_token');
    if (!this.jwt || this.jwt === 'null' || this.jwt === 'undefined' || this.jwt === 'false') {
      this.decodedJwt = false;
    } else {
      try {
        this.decodedJwt = this.jwt ? jwt_decode(this.jwt) : false;
      } catch (e) {
        this.ls.remove('id_token');
        this.decodedJwt = false;
      }
    }
    this.isLogin.val = this.decodedJwt;
    this.userName = this.decodedJwt ? this.ls.get('user_id') : '';
  }
   // 判断当前缩放级别
   detectZoom() {
    let ratio = 0;
    const screen = window.screen;
    const ua = navigator.userAgent.toLowerCase();

    if (window.devicePixelRatio !== undefined) {
      ratio = window.devicePixelRatio;
    } else if (ua.indexOf('msie')) {
      if ((screen as any).deviceXDPI && (screen as any).logicalXDPI) {
        ratio = (screen as any).deviceXDPI / (screen as any).logicalXDPI;
      }
    } else if (window.outerWidth !== undefined && window.innerWidth !== undefined) {
      ratio = window.outerWidth / window.innerWidth;
    }

    if (ratio) {
      ratio = Math.round(ratio * 100);
    }

    return ratio;
  }

  // 判断PC端浏览器缩放比例不是100%时的情况
  isScale() {
    const rate = this.detectZoom();
    if (rate !== 200 && rate !== 100) {
      if (this.appService.scale !== rate) {
        this.appService.scale = rate;
        const toastCfg = new ToastConfig(ToastType.INFO, '', '当前显示比例不是100%，如影响使用请置为默认比例.', -1);
        this.toastService.toast(toastCfg);
      }
    } else {
      this.appService.scale = 100;
    }
  }

  ngOnDestroy() {
    this.loginedFlagEvent.unsubscribe();
    this.onresizeEvent.unsubscribe();
    this.httpEvent.unsubscribe();
  }

  getScreenConfig() {
    this.productId = this.routerIonfo.snapshot.queryParams['id'];

    this.httpService.getData({}, this.getDataWay, 'execute', 'fm_system_query_screen', '1')
      .subscribe(
        data => {
          this.classModule = this.forMatdata((data as any).data).sort(function (a, b) {
            return a.sort - b.sort;
          });

          const titleNowChooseId = this.ls.get('titleNowChooseId');
          if (titleNowChooseId) {
            for (const i in this.classModule) {
              if (
                titleNowChooseId === this.classModule[i].menu_id) {
                this.appService.mainListEventEmitter.emit(this.classModule[i]);
                this.classThis = this.classModule[i].name;
                this.appService.titleNowChoose = this.classThis;
              }
            }
          } else {
            let _useNum = 0;
            for (const i in this.classModule) {
              if (this.productId === this.classModule[i].menu_id) {
                _useNum = parseInt(i, 10);
              }
            }

            this.appService.mainListEventEmitter.emit(this.classModule[_useNum]);
            this.classThis = this.classModule[_useNum].name;
            this.appService.titleNowChoose = this.classThis;
          }
        },
        error => {
          toError(error);
        }
      );
  }
 /*
  * 将返回的数据格式化为树形结构
  * */
 forMatdata(data: any) {
  const formatD = [];
  for (const i of data) {
    if (i.content) {
      i.content = JSON.parse(i.content);
    }
    if (i.parent_id === '') {
      formatD.push(i);
    }
  }
  for (const i of data) {
    for (const j of formatD) {
      if (i.parent_id === j.menu_id) {
        if (!j.child) {
          j.child = [];
        }
        j['child'].push(i);
      }
    }
  }
  return formatD;
}
 // 标题点击事件
 changeClass(e: any) {
  let _thisuse: any;
  for (const i of this.classModule) {
    if (i.name === e.target.innerText) {
      this.classThis = i.name;
      this.appService.titleNowChoose = this.classThis;
      // localStorage.setItem('titleNowChooseId', i.menu_id);
      this.ls.set('titleNowChooseId', i.menu_id);
      if (this.router.url.match(/^(\/app\/home).*$/) !== null) {
        this.appService.mainListEventEmitter.emit(i);
      } else {
        _thisuse = i;
        this.router.navigate(['/app/home']);
        setTimeout(() => {
          this.appService.mainListEventEmitter.emit(i);
        }, 50);
        // this.getScreenConfig();
      }

    }
  }
}
 // 点击登录按钮弹出登录框
 login() {
  const modalRef = this.ngbModalService.open(LoginModalComponent, {size: 'lg', backdrop: 'static'});
  modalRef.componentInstance.type = 'Login';
  modalRef.result.then((result) => {
    if (result === 'success') {
      this.appService.mainListEventEmitter.emit('login');
    }
  }, (reason) => {

  });
}
 /*
  * 用户登出
  * */
 logout() {
  this.httpService.getData({}, true, 'logout', 'logout', '1')
    .subscribe(data => {
        // localStorage.removeItem('id_token');
        this.ls.remove('id_token');
        // this.router.navigate(['/app/home']);
        this.router.navigate(['']);
        // this.userName = '';
        this.isLogin.val = false;
        this.ngbModalService.dismissAll();
      },
      error => {
        toError(error);
      }
    );
}







/*
*每个大功能模块的方法
*/
businessManage() {
  const modal = this.ngbModalService.open(ModalComponent, {centered: true, backdrop: 'static'});
  modal.componentInstance.title = {name: '业务管理区划'};
  modal.componentInstance.type = 1;
  modal.componentInstance.data = this.gridHeader.businessManage;
  modal.componentInstance.interface_id = {interface : this.interface.businessManage , del_id: 'canton_id',  gridType1: true};
//  this.menuIsShow = false;
}
adminArea() {
  const modal = this.ngbModalService.open(ModalComponent, {centered: true, backdrop: 'static'});
  modal.componentInstance.title = {name: '行政管理区划'};
  modal.componentInstance.type = 3;
  modal.componentInstance.data = this.gridHeader.adminArea;
  modal.componentInstance.interface_id = {interface : this.interface.adminArea , del_id: 'admin_area_id',  gridType1: true};
//  this.menuIsShow = false;
}
streetManage() {
  this.httpService.getData({},
    true, 'execute', this.interface.adminArea.query, 'sprite')
    .subscribe(
    data => {
      const selectData = (data as any).data;
      const modal = this.ngbModalService.open(ModalComponent, {centered: true, backdrop: 'static'});
      modal.componentInstance.title = {name: '街道维护'};
      modal.componentInstance.type = 5;
      modal.componentInstance.selectData = selectData;
      modal.componentInstance.data = this.gridHeader.streetManage;
      modal.componentInstance.interface_id = {interface : this.interface.streetManage , del_id: 'street_id',  gridType2: true};
    },
    error => {
      toError(error);
    }
  );
//  this.menuIsShow = false;
}
community() {
  this.httpService.getData({},
    true, 'execute', this.interface.adminArea.query, 'sprite')
    .subscribe(
    data => {
      const selectData = (data as any).data;
      const modal = this.ngbModalService.open(ModalComponent, {centered: true, backdrop: 'static'});
      modal.componentInstance.title = {name: '社区维护'};
      modal.componentInstance.type = 7;
      modal.componentInstance.selectData = selectData;
      modal.componentInstance.data = this.gridHeader.community;
      modal.componentInstance.interface_id = {interface : this.interface.community , del_id: 'community_id',  gridType2: true};
    },
    error => {
     toError(error);
    }
  );
  // this.menuIsShow = false;
}
resicommunity() {
  this.httpService.getData({},
    true, 'execute', this.interface.adminArea.query, 'sprite')
    .subscribe(
    data => {
      const selectData = (data as any).data;
      const modal = this.ngbModalService.open(ModalComponent, {centered: true, backdrop: 'static'});
      modal.componentInstance.title = {name: '小区维护'};
      modal.componentInstance.type = 9;
      modal.componentInstance.selectData = selectData;
      modal.componentInstance.data = this.gridHeader.resicommunity;
      modal.componentInstance.interface_id = {interface : this.interface.resicommunity , restypyselect: 'resicommunity_type_id' , del_id: 'resicommunity_id',  gridType2: true};
    },
    error => {
     toError(error);
    }
  );
  // this.menuIsShow = false;
}
slipCommunity() {

  this.httpService.getData({},
    true, 'execute', this.interface.slipCommunityType.query, 'sprite')
    .subscribe(
    data => {
      const selectData = (data as any).data;
      const modal = this.ngbModalService.open(ModalComponent, {centered: true, backdrop: 'static'});
      modal.componentInstance.title = {name: '片区维护'};
      modal.componentInstance.type = 11;
      modal.componentInstance.selectData = selectData;
      modal.componentInstance.data = this.gridHeader.slipCommunity;
      modal.componentInstance.interface_id = {interface : this.interface.slipCommunity , sliptypeselect: 'slip_community_type_id' , del_id: 'slip_community_id',  gridType2: true};
    },
    error => {
     toError(error);
    }
  );
 // this.menuIsShow = false;
}

resicommunityType() {
  const modal = this.ngbModalService.open(ModalComponent, {centered: true, backdrop: 'static'});
  modal.componentInstance.title = {name: '小区类型维护'};
  modal.componentInstance.type = 14;
  modal.componentInstance.data = this.gridHeader.resicommunityType;
  modal.componentInstance.interface_id = {interface : this.interface.resicommunityType , del_id: 'resicommunity_type_id',  gridType2: true};
}

slipCommunityType() {
  const modal = this.ngbModalService.open(ModalComponent, {centered: true, backdrop: 'static'});
  modal.componentInstance.title = {name: '片区类型维护'};
  modal.componentInstance.type = 16;
  modal.componentInstance.data = this.gridHeader.slipCommunityType;
  modal.componentInstance.interface_id = {interface : this.interface.slipCommunityType , del_id: 'slip_community_type_id', gridType2: true};
}
uploadXls() {
  const modal = this.ngbModalService.open(ModalComponent, {centered: true, backdrop: 'static'});
  modal.componentInstance.title = {name: '批量导入'};
  modal.componentInstance.type = 13;
  // this.menuIsShow = false;
}

addrUpdate() {
  if (this.isOpen) {
    const toastCfg = new ToastConfig(ToastType.WARNING, '', '请点击屏幕左下角黑色小框再次对地址更新进行操作!', 10000);
    this.toastService.toast(toastCfg);
    this.menuIsShow = false;
    return;
  } else {
    this.isOpen = true;
  }
  if (this.markCon) {
    this.mapObj.removeControl(this.markCon);
  }

  if (this.mapObj && this.mapObj.getSource('layerSource_point')) {
    this.mapObj.removeSource('layerSource_point');
  }
  if (this.mapObj && this.mapObj.getLayer('layer_gehua_point')) {
    this.mapObj.removeLayer('layer_gehua_point');
  }
  this.menuIsShow = false;
  const modal = this.ngbModalService.open(ModalComponent, {centered: true, backdrop: false});
  modal.componentInstance.title = {name: '地址更新'};
  modal.componentInstance.type = 18;
  modal.componentInstance.data = {header: this.gridHeader.addressUpdate, mapObj: this.mapObj};
  modal.componentInstance.interface_id = {interface : this.interface.addressUpdate , del_id: 'address_id', addr_update: true};
  modal.componentInstance.pointMarkObj.subscribe((result) => {
    this.markCon = result;
  });
  modal.result.then((result) => {
  }, (reason) => {
    this.isOpen = false;
    if (this.markCon) {
      this.mapObj.removeControl(this.markCon);
      this.markCon = undefined;
      if (this.mapObj && this.mapObj.getSource('layerSource_point')) {
        this.mapObj.removeSource('layerSource_point');
      }
      if (this.mapObj && this.mapObj.getLayer('layer_gehua_point')) {
        this.mapObj.removeLayer('layer_gehua_point');
      }
    }
  });
}
/* 分公司管理 */
brancheManage() {
  const modal = this.ngbModalService.open(ModalComponent, {centered: true, backdrop: 'static'});
  modal.componentInstance.title = {name: '分公司列表'};
  modal.componentInstance.type = 31;
  modal.componentInstance.data = this.gridHeader.branchcompany;
  modal.componentInstance.interface_id = {interface : this.interface.branchcompany , del_id: 'company_id',  gridType1: true};
}
/* 日志查询 */
logSelect() {
  const modal = this.ngbModalService.open(ModalComponent, {centered: true, backdrop: 'static'});
  modal.componentInstance.title = {name: '日志查询'};
  modal.componentInstance.type = 32;
  modal.componentInstance.data = this.gridHeader.logselect;
  modal.componentInstance.interface_id = {interface : this.interface.logselect , del_id: 'log_id', logDate: true , log: true, gridType3: true};
}
/* 操作员管理 */
operatorManage() {
  const modal = this.ngbModalService.open(ModalComponent, {centered: true, backdrop: 'static'});
  modal.componentInstance.title = {name: '操作员列表'};
  modal.componentInstance.type = 23;
  modal.componentInstance.data = this.gridHeader.Operatorer;
  modal.componentInstance.interface_id = {interface : this.interface.Operatorer , del_id: 'oper_id', opertor: true, gridType1: true};
}
/* 操作员与用户站 */
operatorAndUserStation() {
  const modal = this.ngbModalService.open(ModalComponent, {centered: true, backdrop: 'static'});
  modal.componentInstance.title = {name: '操作员与用户站管理'};
  modal.componentInstance.type = 20;
  modal.componentInstance.data = {};
}

/* 角色和用户站 */
roleAndUserStation() {
  const modal = this.ngbModalService.open(ModalComponent, {centered: true, backdrop: 'static'});
  modal.componentInstance.title = {name: '角色与用户站管理'};
  modal.componentInstance.type = 21;
  modal.componentInstance.data = {};
}

/* 分公司和用户站 */
brancheAndUserStation() {
  const modal = this.ngbModalService.open(ModalComponent, {centered: true, backdrop: 'static'});
  modal.componentInstance.title = {name: '分公司和用户站管理'};
  modal.componentInstance.type = 22;
  modal.componentInstance.data = {};
}

/* 角色管理 */
roleManage() {
  const modal = this.ngbModalService.open(ModalComponent, {centered: true, backdrop: 'static'});
  modal.componentInstance.title = {name: '角色列表'};
  modal.componentInstance.type = 27;
  modal.componentInstance.data = this.gridHeader.roleManage;
  modal.componentInstance.interface_id = {interface : this.interface.roleManage , del_id: 'role_id',  gridType1: true};
}

/* 用户站管理 */
userStationManage() {
  const modal = this.ngbModalService.open(ModalComponent, {centered: true, backdrop: 'static'});
  modal.componentInstance.title = {name: '用户站列表'};
  modal.componentInstance.type = 29;
  modal.componentInstance.data = this.gridHeader.userStation;
  modal.componentInstance.interface_id = {interface : this.interface.userStation , del_id: 'user_station_id',  gridType1: true};
}
/* 地理专题 */
geo() {
  if (this.isOpen) {
    const toastCfg = new ToastConfig(ToastType.WARNING, '', '为了避免冲突请关闭屏幕左下角黑色小框的地址更新模块!', 10000);
    this.toastService.toast(toastCfg);
    return;
  } else {
    this.menuIsShow = false;
    // let mapgeo;
    this.httpService.getData({ is_marked: 1 },
      true, 'etl', 'queryAddress', 'sprite')
      .subscribe(
      data => {
       // 获取地图上点的经纬度
       if (data && data.status > 0 ) {
        const Data = this.is_data_root(data);
        this.geoJson = {
          type: 'FeatureCollection',
          features: []
      };
        if (Data && Data.length > 0) {
          for (const v of Data) {
            const coord = [];
            // 生成点的图层 json集合
            coord.push(Number(v.pointx));
            coord.push(Number(v.pointy));
              const obj = {
                'type': 'Feature',
                'geometry': {
                    'type': 'Point',
                    'coordinates': coord
                },
                'properties': {
                }
              };
            this.geoJson.features.push(obj);
          }
        }
        this.mapObj.getSource('layerSource').setData(this.geoJson);
        this.mapObj.jumpTo({
          center: [116.408146, 39.907430],
          zoom: 8
          });
      }
    },
      error => {
       toError(error);
      }
    );
  }
}
getBestZoom(bound: any) {
  const grade = [];
  let zoom = [];
  for (let m = 0; m < 23; m++) {
    grade.push(((85.05113 + 85.05113) / 512) * Math.pow(2, -m));
  }
  const dimensions = this.mapObj._containerDimensions();
  const width = dimensions[0];
  const height = dimensions[1];
  const dissX = Math.abs(bound[0][0] - bound[1][0]) / width;
  const dissY = Math.abs(bound[0][1] - bound[1][1]) / height;
  const grade1 = Math.min(dissX, dissY);
  for (let i = 0; i < grade.length; i++) {
    if (grade[i] > grade1 && grade1 > grade[i + 1]) {
      zoom = [i, Number(i + 1)];
    } else {
    }
  }
  return zoom;
}
menuClic() {
    if (this.isOpen) {
      const toastCfg = new ToastConfig(ToastType.WARNING, '', '请关闭当前或最小化的地址更新模块再进行其他操作!', 2000);
      this.toastService.toast(toastCfg);
      return;
    }
    this.menuIsShow = !this.menuIsShow;
    this.loadRoleModule( this.menuIsShow);
}

// 加载角色模块
loadRoleModule(status: any) {
  if (status) {
    this.titleNameAddress = [];
    this.titleNameCommunityOne = [];
    this.titleNameCommunityTwo = [];
    this.titleNameSystemOne = [];
    this.titleNameSystemTwo = [];
    this.httpService.getData({},
      true, 'etl', 'queryModuleByUser', 'sprite')
      .subscribe(
      Data => {
        // 获取用户的id
       if (Data && Data.status > 0 && Data.data.result > 0) {
        for (let i = 0; i < Data.data.list.length; i++) {
          if (Data.data.list[i].parent_module_id === 0) {
            this.titleNameAddress.push(Data.data.list[i]);
          }

          if (Data.data.list[i].parent_module_id === 1 && Data.data.list[i].menu_level === 1) {
            this.titleNameCommunityOne.push(Data.data.list[i]);
          }

          if (Data.data.list[i].parent_module_id === 1 && Data.data.list[i].menu_level === 2) {
            this.titleNameCommunityTwo.push(Data.data.list[i]);
          }

          if (Data.data.list[i].parent_module_id === 2 && Data.data.list[i].menu_level === 1) {
            this.titleNameSystemOne.push(Data.data.list[i]);
          }

          if (Data.data.list[i].parent_module_id === 2 && Data.data.list[i].menu_level === 2) {
            this.titleNameSystemTwo.push(Data.data.list[i]);
          }
        }
        for (let i = 0; i < this.titleNameAddress.length - 1; i++) {
          if (this.titleNameAddress[i].seq > this.titleNameAddress[i + 1].seq) {
            const temp = this.titleNameAddress[i + 1];
            this.titleNameAddress[i + 1] = this.titleNameAddress[i];
            this.titleNameAddress[i] = temp;
          }
        }

        for (let i = 0; i < this.titleNameCommunityOne.length - 1; i++) {
          if (this.titleNameCommunityOne[i].seq > this.titleNameCommunityOne[i + 1].seq) {
            const temp = this.titleNameCommunityOne[i + 1];
            this.titleNameCommunityOne[i + 1] = this.titleNameCommunityOne[i];
            this.titleNameCommunityOne[i] = temp;
          }
        }

        for (let i = 0; i < this.titleNameCommunityTwo.length - 1; i++) {
          if (this.titleNameCommunityTwo[i].seq > this.titleNameCommunityTwo[i + 1].seq) {
            const temp = this.titleNameCommunityTwo[i + 1];
            this.titleNameCommunityTwo[i + 1] = this.titleNameCommunityTwo[i];
            this.titleNameCommunityTwo[i] = temp;
          }
        }

        for (let i = 0; i < this.titleNameSystemOne.length - 1; i++) {
          if (this.titleNameSystemOne[i].seq > this.titleNameSystemOne[i + 1].seq) {
            const temp = this.titleNameSystemOne[i + 1];
            this.titleNameSystemOne[i + 1] = this.titleNameSystemOne[i];
            this.titleNameSystemOne[i] = temp;
          }
        }

        for (let i = 0; i < this.titleNameSystemTwo.length - 1; i++) {
          if (this.titleNameSystemTwo[i].seq > this.titleNameSystemTwo[i + 1].seq) {
            const temp = this.titleNameSystemTwo[i + 1];
            this.titleNameSystemTwo[i + 1] = this.titleNameSystemTwo[i];
            this.titleNameSystemTwo[i] = temp;
          }
        }
      } else {
        const toastCfg = new ToastConfig(ToastType.ERROR, '', '该用户没有角色', 10000);
        this.toastService.toast(toastCfg);
      }
    },
      error => {
       toError(error);
      }
    );
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
// 清除点
deletePoint() {
  if (this.mapObj && this.mapObj.getSource('layerSource')) {
    this.mapObj.getSource('layerSource').setData(this.nullgeoJson);
  }
}
titleClick(event) {
  if (event.module_id !== 13) {
     this.deletePoint();
  }
  /* 11'地址更新' 12, '批量导入 13'地理专题
  *  21 行政管理区划维护 22 '业务管理区划维护
  *  23 '街道维护 24 '小区维护 25 '社区维护' 26 '片区维护
  *  27 '操作员管理' 28 '操作员与用户站关系管理
  *  31 '分公司管理' 32 '分公司与用户站关系管理 33 '用户站管理 34'角色管理' 35 '角色与模块关系管理' 36  37  38 日志查询
   */
  switch ( event.module_id ) {
    case 11 :
        this.addrUpdate();
        break;
    case 12 :
        this.uploadXls();
        break;
    case 13 :
        this.geo();
        break;
    case 21 :
        this.adminArea();
        break;
    case 22 :
        this.businessManage();
        break;
    case 23 :
        this.streetManage();
        break;
    case 24 :
        this.resicommunity();
        break;
    case 25 :
        this.slipCommunity();
        break;
    case 26 :
        this.community();
        break;
    case 27 :
        this.resicommunityType();
        break;
    case 28 :
        this.slipCommunityType();
        break;
    case 31 :
        this.operatorManage();
        break;
    case 32 :
        this.operatorAndUserStation();
        break;
    case 33 :
        this.brancheManage();
        break;
    case 34 :
        this.brancheAndUserStation();
        break;
    case 35 :
        this.userStationManage();
        break;
    case 36 :
        this.roleManage();
        break;
    case 37 :
        this.roleAndUserStation();
        break;
    case 38 :
        this.logSelect();
        break;
  }
}

}
