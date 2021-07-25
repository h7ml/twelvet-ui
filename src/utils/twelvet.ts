import TWT from '@/setting'
import { history } from 'umi'

/**
 * 系统日志输出
 */
export const system = {
    log: (...args: any) => {
        if (TWT.isDev) {
            console.log('【TWT】Log:', ...args)
        }
    },
    table: (...args: [any]) => {
        if (TWT.isDev) {
            console.table('【TWT】Table:', ...args)
        }
    },
    /**
     * 唯一的生成环境同样显示
     */
    error: (...args: any) => {
        console.error('【TWT】Error:', ...args)
    },
    trace: (...args: any) => {
        if (TWT.isDev) {
            console.trace('【TWT】Trace:', ...args)
        }
    }
}

/**
 * 构造树型结构数据
 * @param {Array<{ [key: string]: any }>} data 数据源
 * @param {string} id id字段 默认 'id'
 * @param {string} parentId 父节点字段 默认 'parentId'
 * @param {string} children 孩子节点字段 默认 'children'
 * @param {{ [key: string]: any }} enhance 增强参数，通常用于增强或适配需要的参数
 * @param {number} rootId 根Id 默认 0
 */
export const makeTree = (params: {
    dataSource: Record<string, any>[],
    id?: string | 'id',
    parentId?: string | 'parentId',
    children?: string | 'children',
    enhance?: Record<string, string> | {},
    rootId?: number | false | 0
}) => {
    // 获取默认数据
    const id = params.id || 'id'
    const parentId = params.parentId || 'parentId'
    const children = params.children || 'children'
    const enhance = params.enhance || {}
    const rootId = params.rootId || 0

    // 对源数据深克隆
    const cloneData = JSON.parse(JSON.stringify(params.dataSource))


    // 循环所有项
    const treeData = cloneData.filter((father: { [key: string]: any; children: any }) => {
        // 增强参数
        for (const key in enhance) {
            father[key] = father[enhance[key]]
        }

        // 循环找出每个父目录的子目录
        const branchArr = cloneData.filter((child: Record<string, any>) => {
            // 返回每一项的子级数组
            return father[id] === child[parentId]
        })


        // 放进子分类
        if (branchArr.length > 0) {
            father[children] = branchArr
        }

        // 无需判断直接返回
        if (!rootId && rootId != 0) {
            return true
        }

        // 返回第一层
        return father[parentId] === rootId
    })

    if (treeData.length > 0) {
        return treeData
    }

    system.error('树列表制作可能出错了,请检查是否正确数据')

    return cloneData
}

/**
 * 统一退出登录操作
 */
export const logout = () => {

    // 清除access_token/refresh_token
    localStorage.removeItem(TWT.accessToken)
    localStorage.removeItem(TWT.refreshToken)

    history.push('/login');
}

/**
 * 获取所有菜单（不包含目录）
 * @param menus 被标准化列表数据
 */
export const reductionMenuList = (menus: [{
    name: string,
    path: string,
    hidden: boolean,
    icon: string,
    menuType: string,
    routes: []
}]) => {
    const res = []
    menus.map(item => {

        let closable = true
        // 默认首页不允许关闭
        if (item.path === '/') {
            closable = false
        }

        if (item.menuType === 'C') {
            // 将所有菜单添加
            const menu = {
                title: item.name,
                key: item.path,
                path: item.path,
                icon: item.icon,
                closable
            }

            res.push(menu)
        }

        if (item.routes && item.routes.length > 0) {
            const reductionMenus = reductionMenuList(item.routes)
            res.push(...reductionMenus)
        }
    })

    return res
}