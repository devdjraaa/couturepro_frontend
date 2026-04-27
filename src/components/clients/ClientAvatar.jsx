import Avatar from '@/components/ui/Avatar'
import { getClientPhoto } from '@/utils/clientPhotoStorage'

export default function ClientAvatar({ client, size, className }) {
  const localPhoto = getClientPhoto(client?.id)
  const fullName = `${client?.prenom ?? ''} ${client?.nom ?? ''}`.trim()
  return (
    <Avatar
      nom={fullName}
      photo_url={localPhoto || client?.photo_url || null}
      avatar_index={localPhoto ? undefined : client?.avatar_index}
      size={size}
      className={className}
    />
  )
}
