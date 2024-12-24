const allRoles = {
  admin: [],
  doctor: [],
  patient: [],
  receptionist: [],
  therapist: [],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};
