export function uuid(){
  return crypto.randomUUID()
}

export function hoje(){
  return new Date().toISOString()
}
