/**
 * 
 * @param {never} _value 
 */
export function exhaustiveGuard(_value){
    throw new Error(`Error! Reached forbiden guard funciont with unexécted value:  ${JSON.stringify(_value)}`)
}