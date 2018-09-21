// const BASE_URL = 'https://icmp2.propersoft.cn/icmp/server-dev'
const BASE_URL = WebIM.config.BASE_URL
const PP_AUTH = BASE_URL + '/auth/login'
const PP_GROUPS = BASE_URL + '/im/groups/'
const PP_CONCATS = BASE_URL + '/im/contacts?type=0'
const PP_USER = BASE_URL + '/im/contacts/users/'
const PP_FILE = BASE_URL + '/file/'

module.exports = {
    BASE_URL,
    PP_AUTH,
    PP_GROUPS,
    PP_CONCATS,
    PP_USER,
    PP_FILE,
}