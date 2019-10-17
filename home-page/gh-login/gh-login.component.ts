import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import {AppService} from '../../../s-service/app.service';
import {HttpService} from '../../../s-service/http.service';
import { LocalStorage} from '../../../s-service/local.storage';
import {ToastConfig, ToastType, ToastService} from '../../../smx-unit/smx-unit.module';
@Component({
  selector: 'app-gh-login',
  templateUrl: './gh-login.component.html',
  styleUrls: ['./gh-login.component.scss']
})
export class GhLoginComponent implements OnInit {

  userName: any;
  userPasswd: any;
  loginedFlagEvent: any;
  constructor(public router: Router,
    private appService: AppService,
    public httpService: HttpService,
    private ls: LocalStorage,
    private toastService: ToastService) {
      /* this.loginedFlagEvent = this.appService.loginedFlagEventEmitter.subscribe((value: string) => {
        if (value) {
          if (value === 'logined') {
            this.userName = this.ls.get('user_id');
            // this.isLogin.val = true;
          } else if (value === 'loginout') {
            this.ls.remove('id_token');
            // this.isLogin.val = false;
            this.ngbModalService.dismissAll();
          }
        }
      }); */
    }

  ngOnInit() {
  }

  login() {
    if (this.userName && !this.userPasswd) {
          const toastCfg = new ToastConfig(ToastType.WARNING, '', '密码不能为空!', 3000);
          this.toastService.toast(toastCfg);
    }
    if (!this.userName && this.userPasswd) {
          const toastCfg = new ToastConfig(ToastType.WARNING, '', '用户名不能为空!', 3000);
          this.toastService.toast(toastCfg);
    }
    if (!this.userName && !this.userPasswd) {
          const toastCfg = new ToastConfig(ToastType.WARNING, '', '用户名和密码不能为空!', 3000);
          this.toastService.toast(toastCfg);
    }
    const body = {
      userName: this.userName,
      userPass: this.userPasswd,
      type: 'local'
    };
    this.httpService.getData(body, false, 'login', 'login', '1')
      .subscribe(
        data => {
          if ((data as any).status < 0) {
            return;
          }
          this.ls.set('id_token', (data as any).token);
          this.ls.set('user_id', this.userName);
          this.ls.set('userId', (data as any).data.user_id);
          this.appService.loginedFlagEventEmitter.emit('logined');
          const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '登录成功!', 3000);
          this.toastService.toast(toastCfg);
          this.router.navigate(['/app']);
        },
        error => {
          const toastCfg = new ToastConfig(ToastType.ERROR, '', error, 1000);
          this.toastService.toast(toastCfg);
        }
      );

}

enter (e: any) {
    const code  = window.event ? e.keyCode : e.which;
    if (code === 13) {
      this.login();
      this.enter1();
    }
  }

enter1 () {
  // const arr1 = [1, 2, 3];
  // const arr2 = [4, 5, 6];
  // const arr3 = [7, 8, 9];
  // arr1.push(... arr2);
  // debugger
  // console.log(arr1);
}
}
