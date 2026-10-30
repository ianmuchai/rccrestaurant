import {test} from 'node:test';
import assert from 'node:assert/strict';
import {GET,HEAD} from '../app/google/route.ts';

test('printed Google-profile URL redirects directly to the verified RCC listing',()=>{
 for(const handler of [GET,HEAD]){
  const response=handler();
  assert.equal(response.status,302);
  assert.equal(response.headers.get('Location'),'https://www.google.com/maps?cid=5135303326429331150');
  assert.equal(response.headers.get('Cache-Control'),'no-store');
  assert.equal(response.headers.get('X-Robots-Tag'),'noindex, follow');
 }
});
