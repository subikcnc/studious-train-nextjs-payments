function foo(x) {
  return x * 2;
}

for (let i = 0; i < 1e6; i++) {
  foo(i);
}

foo(10);
