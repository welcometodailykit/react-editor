import React from 'react'
import { Treebeard } from 'react-treebeard'
import { useQuery } from '@apollo/react-hooks'
import mime from 'mime-types'

// Queries
import { GET_EXPLORER_CONTENT } from '../queries'

import { Context } from '../state/context'

import { FolderCloseIcon, FolderOpenIcon, FileIcon } from '../assets/Icons'

const RenderTree = () => {
    const { dispatch } = React.useContext(Context)
    const {
        loading: queryLoading,
        error: queryError,
        data: queryData,
    } = useQuery(GET_EXPLORER_CONTENT, {
        variables: { path: './../apps' },
    })

    const [data, setData] = React.useState({})
    const [cursor, setCursor] = React.useState(false)

    React.useEffect(() => {
        if (queryData && queryData.getFolderWithFiles) {
            setData({ ...queryData.getFolderWithFiles, toggled: true })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [queryData])

    const onToggle = (node, toggled) => {
        if (cursor) {
            cursor.active = false
        }
        node.active = true
        if (node.children) {
            node.toggled = toggled
        }
        setCursor(node)
        if (
            node.type === 'file' &&
            mime.lookup(node.name) === 'application/json'
        ) {
            let index = node.path.lastIndexOf('/') + 1
            dispatch({
                type: 'ADD_TAB',
                payload: {
                    name: node.path.slice(index),
                    path: node.path,
                },
            })
        }
        setData(Object.assign({}, data))
    }
    const decorators = {
        Toggle: props => {
            if (props.type === 'file') {
                return FileIcon
            } else if (props.toggled) {
                return <FolderOpenIcon />
            }
            return <FolderCloseIcon />
        },
        Header: props => {
            return (
                <span
                    style={{
                        marginLeft: '8px',
                    }}
                    title={props.node.name}
                >
                    {props.node.name &&
                        `${
                            props.node.name.length > 12
                                ? `${props.node.name.slice(0, 12)}...`
                                : props.node.name
                        }`}
                </span>
            )
        },
        Container: props => {
            return (
                <div
                    onClick={props.onClick}
                    style={{
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                    }}
                >
                    <props.decorators.Toggle
                        toggled={props.node.toggled}
                        type={props.node.type}
                    />
                    <props.decorators.Header {...props} />
                </div>
            )
        },
    }
    if (queryLoading) {
        return <div>Loading...</div>
    }
    if (queryError) {
        return <div>Error</div>
    }
    return (
        <Treebeard
            style={{
                tree: {
                    base: {
                        backgroundColor: 'white',
                    },
                    node: {
                        activeLink: {
                            background: 'transparent',
                        },
                    },
                },
            }}
            data={data}
            onToggle={onToggle}
            decorators={decorators}
        />
    )
}

export default RenderTree
