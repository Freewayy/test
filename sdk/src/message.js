var CryptoJS = require("crypto-js");
(function() {
	"use strict";

	var _utils = require("./utils").utils;
	var Message = function(type, id) {
		if (!this instanceof Message) {
			return new Message(type);
		}

		this._msg = {};

		if (typeof Message[type] === "function") {
			Message[type].prototype.setGroup = this.setGroup;
			this._msg = new Message[type](id);
		}
		return this._msg;
	};
	Message.prototype.setGroup = function(group) {
		this.body.group = group;
	};

	/*
     * Read Message
     */
	Message.read = function(id) {
		this.id = id;
		this.type = "read";
	};

	Message.read.prototype.set = function(opt) {
		this.body = {
			ackId: opt.id,
			to: opt.to
		};
	};

	/*
     * deliver message
     */
	Message.delivery = function(id) {
		this.id = id;
		this.type = "delivery";
	};

	Message.delivery.prototype.set = function(opt) {
		this.body = {
			bodyId: opt.id,
			to: opt.to,
			ext: opt.ext
		};
	};

	/*
     * text message
     */
	Message.txt = function(id) {
		this.id = id;
		this.type = "txt";
		this.body = {};
	};
	Message.txt.prototype.set = function(opt) {
		this.value = opt.msg;
		this.body = {
			id: this.id,
			to: opt.to,
			msg: this.value,
			type: this.type,
			roomType: opt.roomType,
			ext: opt.ext || {},
			success: opt.success,
			fail: opt.fail
		};

		!opt.roomType && delete this.body.roomType;
	};

	/*
     * cmd message
     */
	Message.cmd = function(id) {
		this.id = id;
		this.type = "cmd";
		this.body = {};
	};
	Message.cmd.prototype.set = function(opt) {
		this.value = "";

		this.body = {
			to: opt.to,
			action: opt.action,
			msg: this.value,
			type: this.type,
			roomType: opt.roomType,
			ext: opt.ext || {},
			success: opt.success
		};
		!opt.roomType && delete this.body.roomType;
	};

	/*
     * loc message
     */
	Message.location = function(id) {
		this.id = id;
		this.type = "loc";
		this.body = {};
	};
	Message.location.prototype.set = function(opt) {
		this.body = {
			to: opt.to,
			type: this.type,
			roomType: opt.roomType,
			addr: opt.addr,
			lat: opt.lat,
			lng: opt.lng,
			ext: opt.ext || {}
		};
	};

	/*
     * img message
     */
	Message.img = function(id) {
		this.id = id;
		this.type = "img";
		this.body = {};
	};
	Message.img.prototype.set = function(opt) {
		opt.file = opt.file || _utils.getFileUrl(opt.fileInputId);

		this.value = opt.file;

		this.body = {
			id: this.id,
			file: this.value,
			apiUrl: opt.apiUrl,
			to: opt.to,
			type: this.type,
			ext: opt.ext || {},
			roomType: opt.roomType,
			onFileUploadError: opt.onFileUploadError,
			onFileUploadComplete: opt.onFileUploadComplete,
			success: opt.success,
			fail: opt.fail,
			flashUpload: opt.flashUpload,
			width: opt.width,
			height: opt.height,
			body: opt.body,
			uploadError: opt.uploadError,
			uploadComplete: opt.uploadComplete
		};

		!opt.roomType && delete this.body.roomType;
	};

	/*
     * audio message
     */
	Message.audio = function(id) {
		this.id = id;
		this.type = "audio";
		this.body = {};
	};
	Message.audio.prototype.set = function(opt) {
		opt.file = opt.file || _utils.getFileUrl(opt.fileInputId);

		this.value = opt.file;
		this.filename = opt.filename || this.value.filename;

		this.body = {
			id: this.id,
			file: this.value,
			filename: this.filename,
			apiUrl: opt.apiUrl,
			to: opt.to,
			type: this.type,
			ext: opt.ext || {},
			length: opt.length || 0,
			roomType: opt.roomType,
			file_length: opt.file_length,
			onFileUploadError: opt.onFileUploadError,
			onFileUploadComplete: opt.onFileUploadComplete,
			success: opt.success,
			fail: opt.fail,
			flashUpload: opt.flashUpload,
			body: opt.body
		};
		!opt.roomType && delete this.body.roomType;
	};

	/*
     * file message
     */
	Message.file = function(id) {
		this.id = id;
		this.type = "file";
		this.body = {};
	};
	Message.file.prototype.set = function(opt) {
		opt.file = opt.file || _utils.getFileUrl(opt.fileInputId);

		this.value = opt.file;
		this.filename = opt.filename || this.value.filename;

		this.body = {
			id: this.id,
			file: this.value,
			filename: this.filename,
			apiUrl: opt.apiUrl,
			to: opt.to,
			type: this.type,
			ext: opt.ext || {},
			roomType: opt.roomType,
			onFileUploadError: opt.onFileUploadError,
			onFileUploadComplete: opt.onFileUploadComplete,
			success: opt.success,
			fail: opt.fail,
			flashUpload: opt.flashUpload,
			body: opt.body
		};
		!opt.roomType && delete this.body.roomType;
	};

	/*
     * video message
     */
	Message.video = function(id) {};
	Message.video.prototype.set = function(opt) {};

	var _Message = function(message) {
		if (!this instanceof _Message) {
			return new _Message(message, conn);
		}

		this.msg = message;
	};

	_Message.prototype.send = function(conn) {
		var me = this;

		var _send = function(message) {
			const userId = conn.context.userId;
			let ext = {};
			if (message.group || Demo.remarks[message.to]) {
				const to = message.group
					? Demo.groups[message.to]
					: Demo.remarks[message.to];
				const {
					toUserId,
					avatar,
					remark,
					headImage,
					groupName
				} = to;
				ext = {
					from_user_id: userId, // 自己的环信 id
					from_username: Demo.userInfo.name, // 自己的昵称
					from_headportrait: Demo.userInfo.avatar, // 自己的头像
					from_chatId: Demo.userInfo.id, // 自己的 id
					to_user_id: message.to, // 对方的环信 id
					to_username: remark || groupName, // 对方的昵称
					to_headportrait: avatar || headImage, // 对方的头像
					to_chatId: toUserId // 对方的 id
				};
			} else {
				ext = {
					from_username: message.to,
					to_user_id: message.to,
					to_username: message.to
				};
			}

			if (message.type !== "file" && message.body.url) {
				ext["%/IMAGEFLAG/%"] = message.body.url;
				message.body.msg = "[图片]";
				message.body.type = "txt";
			}
			message.ext = message.ext || {};
			message.ext = { ...ext };
			message.ext.weichat = message.ext.weichat || {};
			message.ext.weichat.originType =
				message.ext.weichat.originType || "webim";

			var dom;
			var json = {
				from: conn.context.userId || "",
				to: message.to,
				bodies: [message.body],
				ext: message.ext || {}
			};
			var jsonstr = _utils.stringify(json);
			dom = $msg({
				type: message.group || "chat",
				to: message.toJid,
				id: message.id,
				xmlns: "jabber:client"
			})
				.c("body")
				.t(jsonstr);

			if (message.roomType) {
				dom.up().c("roomtype", {
					xmlns: "easemob:x:roomtype",
					type: "chatroom"
				});
			}
			if (message.bodyId) {
				dom = $msg({
					from: conn.context.jid || "",
					to: message.toJid,
					id: message.id,
					xmlns: "jabber:client"
				})
					.c("body")
					.t(message.bodyId);
				var delivery = {
					xmlns: "urn:xmpp:receipts",
					id: message.bodyId
				};
				dom.up().c("delivery", delivery);
			}
			if (message.ackId) {
				if (
					conn.context.jid.indexOf(
						message.toJid
					) >= 0
				) {
					return;
				}
				dom = $msg({
					from: conn.context.jid || "",
					to: message.toJid,
					id: message.id,
					xmlns: "jabber:client"
				})
					.c("body")
					.t(message.ackId);
				var read = {
					xmlns: "urn:xmpp:receipts",
					id: message.ackId
				};
				dom.up().c("acked", read);
			}

			setTimeout(function() {
				if (
					typeof _msgHash !== "undefined" &&
					_msgHash[message.id]
				) {
					_msgHash[message.id].msg.fail instanceof
						Function &&
						_msgHash[message.id].msg.fail(
							message.id
						);
				}
			}, 60000);
            conn.sendCommand(dom.tree(), message.id);
			if ( message.ext.from_user_id === Demo.userInfo.username ) {
				let msg_type = {},
					title_text,
					push_type,
					to_id,
					url;
				let BASE_URL = require("../../demo/javascript/src/ppApi")["BASE_URL"];
				if (message.group) {
					url = BASE_URL + `/im/groups/${message.ext.to_chatId}/push`;
					title_text = message.ext.to_username;
					to_id = Demo.groups[message.ext.to_user_id].id;
					push_type = "groupchat";
					msg_type = {
						txt: `${message.ext.from_username}:${message.msg}`,
						img: `${message.ext.from_username}:'[图片]'`,
						file: `${message.ext.from_username}:'[文件]'`
					};
				} else {
					url = BASE_URL + `/im/contacts/push`;
					title_text = message.ext.from_username;
					to_id = message.ext.to_chatId;
					push_type = "singleChat";
					msg_type = {
						txt: message.msg,
						img: "[图片]",
						file: "[文件]"
					};
				}
				const {
					from_chatId,
					from_headportrait,
					from_user_id,
					from_username,
					to_headportrait,
					to_user_id,
					to_username
				} = message.ext;
				const push_data = {
					title: title_text,
					content: msg_type[message.type],
					toUserId: to_id,
					customs: {
						bean: {
							chatId: from_chatId,
							from_headportrait,
							from_user_id,
							from_username,
							to_headportrait,
							to_user_id,
							to_username
						},
						chatType: push_type,
						push_type: "chat",
						packageName: WebIM.config.packageName
						//"uri": "intent:#Intent;component=com.proper.icmp.dev/com.proper.icmp.dev.MainActivity;S.uri=intent%3A%23Intent%3Bcomponent%3Dcom.proper.icmp.dev%2Fcom.proper.icmp.demo.activity.ChatActivity%3BS.bean%3D%257B%2522chatId%2522%253A%25227fd06a5f-7b3f-42e3-187f-300efa473b95%2522%252C%2522from_headportrait%2522%253A%25228c63ae14-de20-4d74-a4cf-253a03010511%2522%252C%2522from_user_id%2522%253A%252213610823703%2522%252C%2522from_username%2522%253A%2522%25E6%2597%25B6%25E6%25B5%25A9%25E5%25AE%2587%2522%252C%2522to_headportrait%2522%253A%2522%2522%252C%2522to_user_id%2522%253A%252215640486369%2522%252C%2522to_username%2522%253A%2522%25E9%2582%25A2%25E9%259D%2599%2522%257D%3BS.type%3DsingleChat%3Bend;end"
					}
				};
				window.fetch(url, {
					method: "PUT",
					body: JSON.stringify(push_data),
					headers: {
						Accept: "*/*",
						"Content-Type": "application/json; charset=utf-8",
						"X-PEP-TOKEN": Demo.ppToken
					}
				}).then(res => {
					if (res.status !== 200) {
						console.log("推送失败");
					}
				});
			}
		};

		if (me.msg.file) {
			if (me.msg.body && me.msg.body.url) {
				// Only send msg
				_send(me.msg);
				return;
			}
			var _tmpComplete = me.msg.onFileUploadComplete;
			var _complete = function(data) {
				if (typeof data === "string") {
					var url = data,
						secret = "1";
				} else {
					if (data.entities[0]["file-metadata"]) {
						var file_len =
							data.entities[0][
								"file-metadata"
							]["content-length"];
						// me.msg.file_length = file_len;
						me.msg.filetype =
							data.entities[0][
								"file-metadata"
							]["content-type"];
						if (file_len > 204800) {
							me.msg.thumbnail = true;
						}
					}
				}
				me.msg.body = {
					type: me.msg.type || "file",
					url:
						url ||
						(location.protocol !=
							"https:" &&
						conn.isHttpDNS
							? conn.apiUrl +
							  data.uri.substr(
									data.uri.indexOf(
										"/",
										9
									)
							  )
							: data.uri) +
							"/" +
							data.entities[0][
								"uuid"
							],
					secret:
						secret ||
						data.entities[0][
							"share-secret"
						],
					filename:
						me.msg.file.filename ||
						me.msg.filename,
					size: {
						width: me.msg.width || 0,
						height: me.msg.height || 0
					},
					length: me.msg.length || 0,
					file_length:
						me.msg.ext.file_length || 0,
					filetype: me.msg.filetype
				};
				_send(me.msg);
				_tmpComplete instanceof Function &&
					_tmpComplete(data, me.msg.id);
			};

			me.msg.onFileUploadComplete = _complete;
			_utils.uploadFile.call(conn, me.msg);
		} else {
			me.msg.body = {
				type:
					me.msg.type === "chat"
						? "txt"
						: me.msg.type,
				msg: me.msg.msg
			};
			if (me.msg.type === "cmd") {
				me.msg.body.action = me.msg.action;
			} else if (me.msg.type === "loc") {
				me.msg.body.addr = me.msg.addr;
				me.msg.body.lat = me.msg.lat;
				me.msg.body.lng = me.msg.lng;
			}

			_send(me.msg);
		}
	};

	exports._msg = _Message;
	exports.message = Message;
})();
