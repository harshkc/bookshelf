/** @jsx jsx */
import {jsx} from '@emotion/core'

import * as React from 'react'
import {CircleButton, Dialog} from 'components/lib'
import VisuallyHidden from '@reach/visually-hidden'

const ModalContext = React.createContext()
ModalContext.displayName = 'ModalContext'

const callAll =
  (...fns) =>
  (...args) =>
    fns.forEach(fn => fn && fn(...args))

function Modal({children}) {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <ModalContext.Provider value={[isOpen, setIsOpen]}>
      {children}
    </ModalContext.Provider>
  )
}

function ModalOpenButton({children: child}) {
  const [, setIsOpen] = React.useContext(ModalContext)

  return React.cloneElement(child, {
    onClick: callAll(() => setIsOpen(true), child.props.onClick),
  })
}

function ModalDismissButton({children: child}) {
  const [, setIsOpen] = React.useContext(ModalContext)

  return React.cloneElement(child, {
    onClick: callAll(() => setIsOpen(false), child.props.onClick),
  })
}

function ModalContentBase(props) {
  const [isOpen, setIsOpen] = React.useContext(ModalContext)

  return (
    <Dialog isOpen={isOpen} onDismiss={() => setIsOpen(false)} {...props} />
  )
}

function ModalContents({title, children, ...props}) {
  return (
    <ModalContentBase {...props}>
      <div css={{display: 'flex', justifyContent: 'flex-end'}}>
        <ModalDismissButton>
          <CircleButton>
            <VisuallyHidden>Close</VisuallyHidden>
            <span aria-hidden>×</span>
          </CircleButton>
        </ModalDismissButton>
      </div>
      <h3 css={{textAlign: 'center', fontSize: '2em'}}>{title}</h3>
      {children}
    </ModalContentBase>
  )
}

export {Modal, ModalOpenButton, ModalContents, ModalContentBase}
