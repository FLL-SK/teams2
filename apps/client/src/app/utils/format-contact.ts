export const formatContact = ({
  contactName = '',
  phone = '',
  email = '',
}: {
  contactName?: string | null;
  phone?: string | null;
  email?: string | null;
}) => `${contactName}, ${phone}, ${email}`;
