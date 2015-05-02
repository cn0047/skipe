define([
    '/js/account/c/chat.js',
    '/js/account/m/chat.js',
    '/js/account/m/post.js',
    '/js/account/c/post.js',
    'text!/js/account/t/home.tpl.html',
    'text!/js/account/t/mainChats.tpl.html',
    'text!/js/account/t/mainPosts.tpl.html',
    'text!/js/account/t/addPeopleToChat.tpl.html',
    'text!/js/account/t/mainUsersInChat.tpl.html'
], function (cChat, mChat, mPost, cPost, t, tChats, tPosts, tAddPeopleToChat, tUsersInChat) {
    return  Backbone.skipeView.extend({
        cChat: new cChat(),
        mChat: new mChat(),
        cPost: new cPost(),
        mPost: mPost,
        tpl: t,
        tplChats: tChats,
        tplPosts: tPosts,
        tplAddPeopleToChat: tAddPeopleToChat,
        tplUsersInChat: tUsersInChat,
        activeChatId: '',
        events:{
            'click #mainChats a': 'activateChat',
            'click #mainPosts #showUsersOfChat': 'showUsersOfChat',
            'click #mainPosts #addPeopleToChat': 'addPeopleToChat',
            'keypress #newPost': 'newPost',
            'change #chatCaption': 'changeChatCaption',
            'click #addPeopleToChatModal a': 'addSelectedUserToChat',
        },
        initialize: function () {
            this.cPost.on('afterGetPosts', this.afterGetPosts, this);
            this.cChat.on('afterGetChats', this.afterGetChats, this);
            this.mChat.on('afterRenameChat', this.afterRenameChat, this);
        },
        go: function () {
            this.renderIf();
            this.activate();
            app.views.app.hideLoading();
        },
        render: function () {
            this.$el.html(_.template(this.tpl));
        },
        activate: function () {
            this.getChats();
        },
        getChats: function () {
            this.cChat.hash = 'getChats/user/'+app.views.account.userId;
            this.cChat.fetch({
                success: function (c, r) {
                    c.trigger('afterGetChats', r);
                }
            });
        },
        afterGetChats: function (r) {
            this.renderChats(r);
            this.getPosts();
        },
        renderChats: function (d) {
            this.$('#mainChats').html(_.template(this.tplChats)({data: d}));
            if (_.isEmpty(this.activeChatId)) {
                this.$('#mainChats .list-group a:first').addClass('active');
            } else {
                this.$('#mainChats .list-group a[data-chat='+this.activeChatId+']').addClass('active');
            }
            this.$('#mainChats .settings #chatCaption').val(
                this.$('#mainChats .list-group a:first span:first').html()
            );
        },
        getPosts: function () {
            this.cPost.hash = 'getPosts/chat/'+this.getActiveChatId();
            this.cPost.fetch({
                success: function (c, r) {
                    c.trigger('afterGetPosts', r);
                }
            });
        },
        getActiveChatId: function () {
            return this.$('#mainChats .list-group .active').attr('data-chat');
        },
        afterGetPosts: function (r) {
            this.renderPosts(r);
        },
        renderPosts: function (d) {
            var t = this.tplPosts;
            this.$('#mainPosts #postsContainer').html('');
            _.each(d, function (v) {
                this.$('#mainPosts #postsContainer').append(_.template(t)({v: v}));
            })
            app.views.app.hideLoading();
            app.views.app.trigger('homeActivated');
        },
        activateChat: function (e) {
            this.hideUsersInChat();
            app.views.app.showLoading();
            this.renderPosts({});
            this.$('#mainChats .list-group a').removeClass('active');
            this.$(e.currentTarget).addClass('active');
            this.$('#mainChats .settings #chatCaption').val(
                this.$(e.currentTarget).find('span:first').html()
            );
            this.getPosts();
        },
        newPost: function (e) {
            if (e.which === 13) {
                var m = new mPost();
                m.hash = 'addPost';
                var d = {
                    chat: this.getActiveChatId(),
                    user: app.views.account.user.get('sname'),
                    date: (new Date).toLocaleString(),
                    text: this.$('#newPost').val()
                };
                m.on('afterAddPost', this.afterAddPost, this);
                m.save(d, {
                    success: function (m) {
                        m.trigger('afterAddPost', d);
                    }
                });
                this.cPost.add(m);
            }
        },
        afterAddPost: function (d) {
            this.$('#mainPosts #postsContainer').append(
                _.template(this.tplPosts)({v: d})
            );
            d.user = app.views.account.user.get('token');
            socket.emit('newPost', d);
            this.$('#newPost').val('');
        },
        incomingPost: function (d) {
            if (this.getActiveChatId() === d.chat) {
                this.$('#mainPosts #postsContainer').append(
                    _.template(this.tplPosts)({v: d})
                );
            } else {
                var $el = this.$('#mainChats .list-group a[data-chat='+d.chat+'] .badge');
                if ($el.size()) {
                    var i = parseInt($el.html());
                    if (isNaN(i)) {
                        i = 0;
                    }
                    $el.html(i+1);
                }
            }
        },
        hideUsersInChat: function () {
            if (!this.$('#mainPosts #mainUsersInChat').hasClass('hide')) {
                this.$('#mainPosts #showUsersOfChat').click();
                this.$('#mainUsersInChat .container').html('');
            }
        },
        showUsersOfChat: function () {
            this.$('#mainPosts #mainUsersInChat').toggleClass('hide');
            if (this.$('#mainPosts #mainUsersInChat').hasClass('hide')) {
                return;
            }
            var activeChatId = this.getActiveChatId();
            var v = this;
            this.cChat.find(function (m) {
                if (m.get('chat')._id === activeChatId) {
                    m.hash = 'getUsersInChat/chat/'+activeChatId+'/user/'+app.views.account.userId;
                    m.on('afterGetUsersInChat', v.afterGetUsersInChat, v);
                    m.fetch({
                        success: function (m, r) {
                            m.trigger('afterGetUsersInChat', r);
                        }
                    });
                }
            });
        },
        afterGetUsersInChat: function (r) {
            this.$('#mainUsersInChat .container').html(
                _.template(this.tplUsersInChat)({data: r})
            );
        },
        changeChatCaption: function (e) {
            var caption = this.$(e.currentTarget).val();
            this.$('#mainChats .list-group .active span:first').html(caption);
            var d = {
                chat: this.getActiveChatId(),
                caption: caption,
            };
            this.mChat.hash = 'renameChat';
            this.mChat.save(d, {
                success: function (m) {
                    m.trigger('afterRenameChat', d);
                }
            });
        },
        /**
         * @todo Fix it.
         */
        afterRenameChat: function (r) {
            // var $el = this.$('#mainChats .settings #chatCaption');
            // .effect('highlight', 'fast');
            // $el.animate({backgroundColor: '#dff0d8'}, 1000)
                // .animate({backgroundColor: '#fff'}, 1000);
        },
        addPeopleToChat: function () {
            var activeChatId = this.getActiveChatId();
            var v = this;
            this.cChat.find(function (m) {
                if (m.get('chat')._id === activeChatId) {
                    m.hash = 'getContactsNotInChat/chat/'+activeChatId+'/user/'+app.views.account.userId;
                    m.on('afterGetContactsNotInChat', v.afterGetContactsNotInChat, v);
                    m.fetch({
                        success: function (m, r) {
                            m.trigger('afterGetContactsNotInChat', r);
                        }
                    });
                }
            });
        },
        afterGetContactsNotInChat: function (r) {
            this.$('#addPeopleToChatModal .modal-body').html(
                _.template(this.tplAddPeopleToChat)({data: r})
            );
        },
        addSelectedUserToChat: function (e) {
            // this.$('#addPeopleToChatModal').modal('toggle');
            var activeChatId = this.getActiveChatId();
            var d = {
                chat: activeChatId,
                caption: this.$('#mainChats .settings #chatCaption').val(),
                user: this.$(e.currentTarget).attr('data-userId'),
                sname: this.$(e.currentTarget).html(),
            };
            var v = this;
            this.cChat.find(function (m) {
                if (m.get('chat')._id === activeChatId) {
                    m.hash = 'addSelectedUserToChat/';
                    m.on('afterAddSelectedUserToChat', v.afterAddSelectedUserToChat, this);
                    m.save(d, {
                        success: function (m) {
                            m.trigger('afterAddSelectedUserToChat', d, e);
                        }
                    });
                }
            });
        },
        afterAddSelectedUserToChat: function (d, e) {
            this.$(e.currentTarget).remove();
        },
    });
});
