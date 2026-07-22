export { default as AdminLayout }         from './AdminLayout'
export { default as AdminSidebar }        from './AdminSidebar'
export { default as AdminProtectedRoute } from './AdminProtectedRoute'
export { default as AdminTable }          from './AdminTable'
export { default as AdminBadge }          from './AdminBadge'
export { default as AtelierAvatar }       from './AtelierAvatar'
export { default as ConfigVeille } from './ConfigVeille'

// Kit de formulaire admin (modale + champs) : convention à suivre pour toute
// page admin nouvelle ou retouchée, plutôt que redéfinir INPUT/LABEL localement.
export { default as AdminModal }       from './form/AdminModal'
export { default as AdminField, ADMIN_INPUT, ADMIN_LABEL } from './form/AdminField'
export { default as AdminSelectField } from './form/AdminSelectField'
export { default as AdminNumberField } from './form/AdminNumberField'
export { default as AdminToggle }      from './form/AdminToggle'
export { default as AdminFormSection } from './form/AdminFormSection'
export { default as AdminFormGrid }    from './form/AdminFormGrid'
