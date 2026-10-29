import {describe,it,expect} from 'vitest'
import {parseMode,isDark} from '../src/lib/themeCore'
describe('theme',()=>{
 it('parses stored value, defaulting to system',()=>{expect(parseMode('dark')).toBe('dark');expect(parseMode('x')).toBe('system');expect(parseMode(null)).toBe('system')})
 it('resolves dark',()=>{expect(isDark('dark',false)).toBe(true);expect(isDark('light',true)).toBe(false);expect(isDark('system',true)).toBe(true);expect(isDark('system',false)).toBe(false)})
})
