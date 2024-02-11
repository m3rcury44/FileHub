import styles from "./styles.module.scss";
import {FC, HTMLAttributes, MouseEvent} from "react";
import {useNavigate} from "react-router-dom";
import {ContextMenuItem, initialContextState, setContextMenu} from "../../context-menu";
import {IMergedData} from "../../../shared/types";
import {useAppSelector} from "../../../shared/lib/hooks/useAppSelector.ts";
import {initialTemplateState, setIsActive} from "../";
import {useAppDispatch} from "../../../shared/lib/hooks/useAppDispatch.ts";
import {initialFilterState, PrivacyPopup, RenamePopup, setFilter, setIsFoldersOpen} from "../../popup";
import {Transition} from "react-transition-group";
import {OptionButton} from "../../../shared/UIKit/buttons";

interface IItemTemplate extends HTMLAttributes<HTMLDivElement> {
    itemProps: {
        item: IMergedData
        isGrid: boolean
        index: number
    }
}

const ItemTemplate: FC<IItemTemplate> = ({children, itemProps, ...props}) => {

    const {
        isGrid,
        item,
        index
    } = itemProps

    const dispatch = useAppDispatch()

    const navigate = useNavigate()

    const {isPrivacyOpen, isFoldersOpen, isFolderRenameOpen, filter} = useAppSelector(state => state.popup)
    const {type, x} = useAppSelector(state => state.contextMenu)
    const {id, status} = useAppSelector(state => state.itemTemplate)

    const setActiveState = {
        status: true,
        id: item.id,
        isFolder: Boolean(item.title)
    }

    const handleClickTemplate = (e: MouseEvent<HTMLDivElement | HTMLButtonElement>) => {
        e.stopPropagation()

        if (id !== item.id || !status) {
            dispatch(setIsActive(setActiveState))
        }

        isFoldersOpen && dispatch(setIsFoldersOpen(false))
        filter.isOpen && dispatch(setFilter(initialFilterState))
    }

    const handleRightClick = (e: MouseEvent<HTMLDivElement>) => {
        e.preventDefault()

        dispatch(setContextMenu({
            type: "item",
            x: e.pageX,
            y: e.pageY
        }))

        handleClickTemplate(e)
    }

    const handleSingleClick = (e: MouseEvent<HTMLDivElement>) => {
        handleClickTemplate(e)

        type !== 'initial' && dispatch(setContextMenu(initialContextState))
    };

    const handleDoubleClick = () => {
        if (item.title) {
            navigate(`/folder/${item.id}`)
            dispatch(setIsActive(initialTemplateState))
        }
    }

    const handleOpenContextMenu = (e: MouseEvent<HTMLButtonElement | HTMLDivElement>) => {
        handleClickTemplate(e)

        if (type !== 'item' || x !== 0) {
            dispatch(setContextMenu({
                type: "item",
                x: 0,
                y: 0
            }))
        }
    }

    const condition = status && id === item.id

    const templateClassnames = () => {
        return isGrid
            ? condition ? `${styles.gridItem} ${styles.active}` : styles.gridItem
            : condition ? `${styles.listItem} ${styles.activeList}` : styles.listItem;
    };

    return (
        <>
            <div
                {...props}
                onClick={handleSingleClick}
                onDoubleClick={handleDoubleClick}
                onContextMenu={handleRightClick}
                className={templateClassnames()}
                style={!x ? {position: 'relative'} : {}}
            >
                {children}
                <div className={styles.contextMenuBtn} style={isGrid ? {position: 'relative'} : {position: 'absolute'}}>
                    <OptionButton
                        style={x ? {right: '15px'} : {}}
                        onClick={handleOpenContextMenu}
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </OptionButton>
                </div>
                {type === 'item' && id === item.id &&
                    <ContextMenuItem item={item} index={index} maxIndex={isGrid ? 8 : 3}/>}
            </div>
            {id === item.id &&
                <Transition in={isPrivacyOpen} timeout={200} unmountOnExit>
                    {state => (
                        <PrivacyPopup
                            id={item.id}
                            title={item.title}
                            is_public={item.is_public}
                            transitionState={state}
                        />
                    )}
                </Transition>
            }
            {id === item.id &&
                <Transition in={isFolderRenameOpen} timeout={200} unmountOnExit>
                    {state => (
                        <RenamePopup id={item.id} transitionState={state}/>
                    )}
                </Transition>
            }
        </>
    );
};

export default ItemTemplate;