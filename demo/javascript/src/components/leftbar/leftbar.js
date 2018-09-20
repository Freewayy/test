var React = require('react');

var Avatar = require('../common/avatar');
var Cate = require('./cate');
var Operations = require('./operations');
import { PP_FILE } from '../../ppApi';


module.exports = React.createClass({

    getInitialState: function () {
        var me = this;

        return null;
    },

    shouldComponentUpdate: function (nextProps, nextState) {
        return nextProps.cur !== Demo.selectedCate;
    },

    updateFriend: function () {
        Demo.selectedCate = 'friends';
        this.props.update('friend', true);
    },

    updateGroup: function () {
        Demo.selectedCate = 'groups';
        this.props.update('group', true);
    },

    updateStranger: function () {
        Demo.selectedCate = 'strangers';
        this.props.update('stranger', true);
    },

    updateChatroom: function () {
        Demo.selectedCate = 'chatrooms';
        this.props.update('chatroom', true);
    },

    render: function () {
        const src = Demo.userInfo.avatar ? 
        PP_FILE + Demo.userInfo.avatar + '?access_token=' + Demo.ppToken :
        null
        return (
            <div className='webim-leftbar'>
                <Avatar className='webim-profile-avatar small' title={Demo.user} src={src}/>
                <div className='username'>{Demo.userInfo.name}</div>
                <Cate name='friend' update={this.updateFriend} cur={this.props.cur}/>
                <Cate name='group' update={this.updateGroup} cur={this.props.cur}/>
                {/* <Cate name='chatroom' update={this.updateChatroom} cur={this.props.cur}/> */}
                <Cate name='stranger' update={this.updateStranger} cur={this.props.cur}/>
                <Operations username={Demo.user}/>
            </div>
        );
    }
});
