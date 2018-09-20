var React = require("react");
var Notify = require('../common/notify');
var UI = require('../common/webim-demo');
import { PP_AUTH } from '../../ppApi'
var Input = UI.Input;
var Button = UI.Button;
var Checkbox = UI.Checkbox;

module.exports = React.createClass({
    getInitialState: function () {
        return {
            pageLimit: 8
        };
    },

    keyDown: function (e) {
        if (e && e.keyCode === 13) {
            this.login();
        }
    },

    login: function () {
        var username = this.refs.name.refs.input.value || (WebIM.config.autoSignIn ? WebIM.config.autoSignInName : '');
        var auth = this.refs.auth.refs.input.value || (WebIM.config.autoSignIn ? WebIM.config.autoSignInPwd : '123456');
        var type = this.refs.token.refs.input.checked;
        this.signin(username, '123456', type);
    },

    signin: function (username, auth, type, ppToken) {
        var username = username;
        var auth = auth;
        var ppToken = ppToken;
        var type = type;

        // if (!username || !auth) {
        //     Demo.api.NotifyError(Demo.lan.notEmpty);
        //     return false;
        // }
        
        var options = {
            apiUrl: this.props.config.apiURL,
            user: username.toLowerCase(),
            pwd: auth,
            accessToken: auth,
            ppToken: ppToken,
            appKey: this.props.config.appkey,
            success: function (token, ppInfo) {
                var encryptUsername = btoa(username);
                encryptUsername = encryptUsername.replace(/=*$/g, "");
                var token = token.access_token;
                var url = '#username=' + encryptUsername;
                Demo.token = token;
                
                if(!ppInfo.ppToken){
                    fetch(
                        PP_AUTH,
                        {
                            method:"POST",
                            body:`{"username":${username},"pwd":${auth}}`,
                            headers:{
                                "Accept":"*/*",
                                "Content-Type":"application/json; charset=utf-8",
                                "X-PEP-TOKEN":null
                            }
                        }
                    ).then((res) => {
                        res.text().then( r => { 
                            const data = {}
                            try {
                                let userId = JSON.parse(decodeURIComponent(escape(window.atob(r.split('.')[0])))).id;
                                const userInfo = JSON.parse(decodeURIComponent(escape(window.atob(r.split('.')[1]))));
                                userInfo.userId = userId;
                                data.userInfo = userInfo;
                            } catch (error) {
                                console.log(error)
                            }
                            data.ppToken = r;
                            Demo.ppToken = Demo.conn.ppToken = ppInfo.ppToken;
                            WebIM.utils.setCookie('webim_' + encryptUsername, token, 1);
                            sessionStorage.setItem('ppInfo_' + encryptUsername, JSON.stringify(data));
                            window.location.href = url
                        });
                    })
                }else{
                    Demo.ppToken = Demo.conn.ppToken = ppInfo.ppToken;
                    WebIM.utils.setCookie('webim_' + encryptUsername, token, 1);
                    sessionStorage.setItem('ppInfo_' + encryptUsername, JSON.stringify(ppInfo));
                    window.location.href = url
                } 
            },
            error: function () {
                window.location.href = '#'
            }
        };

        if (!type) {
            delete options.accessToken;
        }
        if (Demo.user) {
            if (Demo.user != username) {
                Demo.chatRecord = {};
            }
        }

        Demo.user = username;

        this.props.loading('show');

        Demo.conn.autoReconnectNumTotal = 0;

        if (WebIM.config.isWindowSDK) {
            var me = this;
            if (!WebIM.config.appDir) {
                WebIM.config.appDir = "";
            }
            if (!WebIM.config.imIP) {
                WebIM.config.imIP = "";
            }
            if (!WebIM.config.imPort) {
                WebIM.config.imPort = "";
            }
            if (!WebIM.config.restIPandPort) {
                WebIM.config.restIPandPort = "";
            }
            WebIM.doQuery('{"type":"login","id":"' + options.user + '","password":"' + options.pwd
                + '","appDir":"' + WebIM.config.appDir + '","appKey":"' + WebIM.config.appkey + '","imIP":"' + WebIM.config.imIP + '","imPort":"' + WebIM.config.imPort + '","restIPandPort":"' + WebIM.config.restIPandPort + '"}', function (response) {
                    Demo.conn.onOpened();
                },
                function (code, msg) {
                    me.props.loading('hide');
                    Demo.api.NotifyError('open:' + code + " - " + msg);
                });
        } else {
            Demo.conn.open(options);
        }
    },

    signup: function () {
        this.props.update({
            signIn: false,
            signUp: true,
            chat: false
        });
    },

    componentWillMount: function () {
        var uri = WebIM.utils.parseHrefHash();
        var username = uri.username;
        var auth = WebIM.utils.getCookie()['webim_' + username];
        var user = sessionStorage.getItem('ppInfo_' + username);
        user = JSON.parse(user);
        Demo.token = auth;
        if (user) {
            Demo.ppToken = user.ppToken;
            Demo.userInfo = user.userInfo;
        }
        if (username && auth) {
            username = atob(username);
            this.signin(username, auth, true, user.ppToken);
        }
    },

    componentDidMount: function () {
        if (WebIM.config.autoSignIn) {
            this.refs.button.refs.button.click();
        }
    },

    render: function () {

        return (
            <div className={this.props.show ? 'webim-sign' : 'webim-sign hide'}>
                <h2>{Demo.lan.signIn}</h2>
                <Input placeholder={Demo.lan.username} defaultFocus='true' ref='name' keydown={this.keyDown}/>
                <Input placeholder={Demo.lan.password} ref='auth' type='password' keydown={this.keyDown}/>
                <div className={WebIM.config.isWindowSDK ? 'hide' : ''}>
                    <Checkbox text={Demo.lan.tokenSignin} ref='token'/>
                </div>
                <Button ref='button' text={Demo.lan.signIn} onClick={this.login}/>
                <p>{Demo.lan.noaccount},
                    <i onClick={this.signup}>{Demo.lan.signupnow}</i>
                </p>
            </div>
        );
    }
});
