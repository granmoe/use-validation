# 1.0.0

## Fast as heck

Now `onChange` and `onBlur` will be the same function references across all renders. This means that only the `error`, `touched`, and `value` properties of each field will ever update, and this means that performance is now perfectly optimized. Zero unnecessary renders.
