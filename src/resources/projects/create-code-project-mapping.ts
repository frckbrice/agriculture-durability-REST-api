import crypto, { createHash } from 'node:crypto';

//TODO: ENCAPSULATE THIS LOGIC IN A FACTORY 

export const uuidToCodeMap = Object.create({
  "308b": "ef799dbf-05ea-411f-94aa-e5a922eff9aa"
});

// generate 4 digits code 
function hashUUID(uuid: string) {
  const hash = createHash('sha256').update(uuid).digest('hex');
  return hash.substring(0, 4);
}

// genreate the mapping between tje uuid and the 4 digits 
export function generateMapping(uuid: string) {
  const code = hashUUID(uuid);

  uuidToCodeMap[code] = uuid as string;
  return { uuid, code };
}

// get the UUID from a code
export function getUUIDFromCode(code: string) {

  console.log("incoming code: ", code);
  console.log("outgoing code: ", uuidToCodeMap);

  for (const key in uuidToCodeMap) {
    if (key === code) {
      return uuidToCodeMap[key];
    }
  }
  return null; // Code not found
}
