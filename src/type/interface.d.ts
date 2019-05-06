export interface Results<T> {
    code: number
    message: string
    data: T
}

export interface StorageNode {
    id: string
    name: string
    parentId: string
    fileFlag: boolean
    token: null | string
    createTime: string
    modifyTime: string
    folderFlag: boolean
    createTimeFormat: string
    modifyTimeFormat: string
}