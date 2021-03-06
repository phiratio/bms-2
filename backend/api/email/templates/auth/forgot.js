const template = ({
  user: {
    firstName,
  },
  location: {
    name,
    address: {
      streetAddress,
      addressLocality,
      addressRegion,
      postalCode,
    },
    gMaps,
    phoneNumber,
  },
  url
}) => `
<mj-section background-color="#ffffff" padding-left="15px" padding-right="15px">
  <mj-column width="100%">
    <mj-text color="#637381">
      Hey ${ firstName ? firstName : 'Valuable Customer'},
    </mj-text>
    <mj-text color="#637381">
      Click below to set a new password
    </mj-text>
  </mj-column>
  <mj-column width="100%">
    <mj-button background-color="#1a1a1a" align="center" color="#ffffff" font-size="17px" font-weight="bold" href="${url}" width="300px">
      Reset password
    </mj-button>
    <mj-text color="#637381" font-size="16px">
      If you have questions, use the contact details below to get in touch with us.
    </mj-text>
  </mj-column>
</mj-section>
`;

module.exports = template;
