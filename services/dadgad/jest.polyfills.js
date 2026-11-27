import { TextEncoder, TextDecoder } from 'util';
import 'whatwg-fetch'; // adds fetch, Request, Response, Headers

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
