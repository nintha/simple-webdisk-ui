import React, { useEffect, useState } from 'react'
import { List, Icon, Upload, Button, message } from 'antd'
import { UploadChangeParam } from '../../node_modules/antd/lib/upload/interface'
const ButtonGroup = Button.Group

const data: StorageNode[] = [
    {
        id: '5ccae53f493ef62c58abd076',
        name: 'biliSpider-logo.jpg',
        parentId: null,
        fileFlag: true,
        token: '5ccae53f493ef62c58abd074',
        createTime: '1556800831',
        modifyTime: '1556800831',
        folderFlag: false,
        createTimeFormat: '2019-05-02T20:40:31.757',
        modifyTimeFormat: '2019-05-02T20:40:31.757'
    }
]

interface StorageNode {
    id: string
    name: string
    parentId: null | string
    fileFlag: boolean
    token: null | string
    createTime: string
    modifyTime: string
    folderFlag: boolean
    createTimeFormat: string
    modifyTimeFormat: string
}

const props = {
    name: 'file',
    action: '/api/v1/storage/nodes/file',
    data: { parentId: null },
    onChange(info: UploadChangeParam) {
        if (info.file.status !== 'uploading') {
            console.log(info.file, info.fileList)
        }
        if (info.file.status === 'done') {
            message.success(`${info.file.name} file uploaded successfully`)
        } else if (info.file.status === 'error') {
            message.error(`${info.file.name} file upload failed.`)
        }
    }
}

const fetchFileList = (parentId: string | null): Promise<Array<StorageNode>> => {
    return fetch(`/api/v1/storage/nodes/byParentId?parentId=${parentId}`)
        .then(res => res.json())
        .then(res => res.data)
}

const createFolder = (parentId: string | null) => {
    fetch(`/api/v1/storage/nodes/folder?name=newfolder&parentId=${parentId}`, { method: 'post' })
}

const FileManager: React.FC = () => {
    const [parentId, setParentId] = useState<string | null>(null)
    const [files, setFiles] = useState<StorageNode[]>([])

    useEffect(() => {
        fetchFileList(parentId).then((list: StorageNode[]) => {
            setFiles(list)
        })
    })

    return (
        <List
            header={
                <div>
                    <div style={{ display: 'inline-block' }}>
                        <Upload {...props}>
                            <Button>
                                <Icon type="upload" />Upload
                            </Button>
                        </Upload>
                    </div>
                    <div style={{ display: 'inline-block', marginLeft: '10px' }}>
                        <Button onClick={() => createFolder(parentId)}>New Folder</Button>
                    </div>
                </div>
            }
            itemLayout="horizontal"
            dataSource={files}
            renderItem={item => (
                <List.Item key={item.id}>
                    <List.Item.Meta
                        title={
                            <span
                                style={{ cursor: 'pointer' }}
                                onClick={() => console.log(`click > ${item.id}`)}
                            >
                                <span style={{ marginRight: '7px', fontSize: '16px' }}>
                                    {item.fileFlag ? (
                                        <Icon type="file" theme="filled" />
                                    ) : (
                                        <Icon type="folder-open" theme="filled" />
                                    )}
                                </span>
                                {item.name}
                            </span>
                        }
                        description={item.modifyTimeFormat}
                    />
                    <div>
                        <ButtonGroup>
                            {item.fileFlag ? (
                                <Button
                                    onClick={() => window.open(`/api/v1/storage/download/${item.token}`)}
                                >
                                    Download
                                </Button>
                            ) : (
                                ''
                            )}
                            <Button
                                onClick={() => {
                                    console.log('rename')
                                }}
                            >
                                Rename
                            </Button>
                            <Button
                                onClick={() =>
                                    fetch(`/api/v1/storage/nodes/file/${item.id}`, {
                                        method: 'delete'
                                    })
                                }
                            >
                                Delete
                            </Button>
                        </ButtonGroup>
                    </div>
                </List.Item>
            )}
        />
    )
}

export default FileManager
