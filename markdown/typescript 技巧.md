## 下面列举了四种常见的无法正常工作的场景以及对应的解决方法：

#### 库本身没有自带类型定义
```
在初次将 react 改造支持 typescript 时, 想必很多人都会遇到 module.hot 报错.
 此时只需要安装对应的类型库即可. 
安装 @types/webpack-env

```
#### 库本身没有类型定义, 也没有相关的@type

```
那只能自己声明一个了. 随便举个栗子. 
declare module "lodash"
```
#### 类型声明库有误
```
1. 推动解决官方类型定义的问题, 提issue, pr 
2. Import 后通过 extends 或者 merge 能力对原类型进行扩展
3. 忍受类型的丢失或不可靠性
4. 使用 // @ts-ignore  忽略

```
#### 类型声明报错

```
在 compilerOptions 的添加"skipLibCheck": true, 曲线救国
```

## 下面列举了几种常见的解决方法：

#### 类型断言
```typescript
语法如下: 
<类型>值

值 as 类型 
// 推荐使用这种语法. 因为<>容易跟泛型, react 中的语法起冲突

举个例子, 如下代码,  padding 值可以是 string , 也可以是 number, 
虽然在代码里面写了 Array(), 我们明确的知道, 
padding 会被parseint 转换成 number 类型, 但类型定义依然会报错. 

function padLeft(value: string, padding: string | number) {
   // 报错: Operator '+' cannot be applied to
   // types 'string | number' and 'number'
   return Array(padding + 1).join(" ") + value;
}

解决方法, 使用类型断言. 告诉 typescript 这里我确认它是 number 类型, 忽略报错. 
function padLeft(value: string, padding: string | number) {
   // 正常
   return Array(padding as number + 1).join(" ") + value;
}

但是如果有下面这种情况, 我们要写很多个 as 么? 
function padLeft(value: string, padding: string | number) {
   console.log((padding as number) + 3);
   console.log((padding as number) + 2);
   console.log((padding as number) + 5);
   return Array((padding as number) + 1).join(' ') + value;
}

```

#### 类型守卫

类型守卫有以下几种方式, 简单的概括以下
typeof:  用于判断 "number"，"string"，"boolean"或 "symbol" 四种类型. 

instanceof : 用于判断一个实例是否属于某个类

in: 用于判断一个属性/方法是否属于某个对象

字面量类型保护

上面的例子中, 是 string | number 类型, 因此使用 typeof 来进行类型守卫. 例子如下: 

```
function padLeft(value: string,padding: string | number) {
   if (typeof padding === 'number') {
       console.log(padding + 3); //正常
       console.log(padding + 2); //正常
       console.log(padding + 5); //正常
        //正常
       return Array(padding + 1).join(' ')value;
   }
   if (typeof padding === 'string') {
       return padding + value;
   }
}
```

```
instanceof :用于判断一个实例是否属于某个类
class Man {
   handsome = 'handsome';
}

class Woman {
   beautiful = 'beautiful';
}

function Human(arg: Man | Woman) {
   if (arg instanceof Man) {
       console.log(arg.handsome);
       console.log(arg.beautiful); // error
   } else {
       // 这一块中一定是 Woman
       console.log(arg.beautiful);
   }
}
```

```
in : 用于判断一个属性/方法是否属于某个对象
interface B {
   b: string;
}

interface A {
   a: string;
}

function foo(x: A | B) {
   if ('a' in x) {
       return x.a;
   }
   return x.b;
}
```

```
字面量类型保护
有些场景, 使用 in, instanceof, typeof 太过麻烦. 这时候可以自己构造一个字面量类型. 
type Man = {
   handsome: 'handsome';
   type: 'man';

};

type Woman = {
   beautiful: 'beautiful';
   type: 'woman';
};

function Human(arg: Man | Woman) {
   if (arg.type === 'man') {
       console.log(arg.handsome);
       console.log(arg.beautiful); // error
   } else {
       // 这一块中一定是 Woman
       console.log(arg.beautiful);
   }
}
```

#### 双重断言
有些时候使用 as 也会报错,因为 as 断言的时候也不是毫无条件的. 它只有当S类型是T类型的子集，或者T类型是S类型的子集时，S能被成功断言成T. 
所以面对这种情况, 只想暴力解决问题的情况, 可以使用双重断言.

```
function handler(event: Event) {
   const element = event as HTMLElement;
   // Error: 'Event' 和 'HTMLElement'
    中的任何一个都不能赋值给另外一个
}
```

如果你仍然想使用那个类型，你可以使用双重断言。首先断言成兼容所有类型的any

```
function handler(event: Event) {
   const element = (event as any) as HTMLElement;
    // 正常
}
```

## 巧用 typescript 支持的 js 最新特性优化代码

#### 1. 可选链 Optional Chining 
```
let x = foo?.bar.baz();


typescript 中的实现如下: 
var _a;
let x = (_a = foo) === null ||
_a === void 0 ? void 0 : _a.bar.baz();

利用这个特性, 我们可以省去写很多恶心的 a && a.b && a.b.c 这样的代码

```

####  2. 空值联合 Nullish Coalescing
```
let x = foo ?? '22';


typescript 中的实现如下: 

let x = (foo !== null && foo !== void 0 ?
foo : '22');
```


## 巧用高级类型灵活处理数据

```
Partial<T>   类型T的所有子集(每个属性都是可选的)
Readonly<T>  返回一个跟T一样的类型, 但会将所有的属性都设置为readonly
Required<T> 但会一个跟T一样的类型 但会将所有的属性都设置为required
Pick<T, K> 从类型T中挑选部分属性K而构造出来的新类型
Exclude<T, U> 从类型T中移除部分属性U而构造出来的新类型
Extract<T, U> 提取联合类型T中所有可以被数值给类型U的部分
NonNullable<T> 从联合类型T中移除null 和undefined而构造出来的新类型
RerureType<T> 表示函数类型T的返回值类型
```



类型索引
为了实现上面的工具函数, 我们需要先了解以下几个语法: 
keyof : 获取类型上的 key 值
extends : 泛型里面的约束
T[K] : 获取对象 T 相应 K 的元素类型

```
type Partial<T> = {
   [P in keyof T]?: T[P]
}
```



Record 作为一个特别灵活的工具. 第一个泛型传入对象的key值, 第二个传入 对象的属性值. 

```
type Record<K extends string, T> = {
   [P in K]: T;
}

```

我们看一下下面的这个对象, 你会怎么用 ts 声明它? 

```
const AnimalMap = {
   cat: { name: '猫', title: 'cat' },
   dog: { name: '狗', title: 'dog' },
   frog: { name: '蛙', title: 'wa' },
};
```

此时用 Record 即可. 

```
type AnimalType = 'cat' | 'dog' | 'frog';

interface AnimalDescription {
name: string, title: string
}

const AnimalMap:Record<AnimalType, AnimalDescription> = {
   cat: { name: '猫', title: 'cat' },
   dog: { name: '狗', title: 'dog' },
   frog: { name: '蛙', title: 'wa' },
};
```

type 和 interface 区别

```
type 只能通过&进行合并   更强大
interface 同名自动合并,通过extends扩展 只能表达object/class/function

```

```


```

常用的 declare

```
shims-tsx.d.ts， 在全局变量 global中批量命名了数个内部模块。
shims-vue.d.ts，意思是告诉 TypeScript *.vue 后缀的文件可以交给 vue 模块来处理。

declare 
var
 
声明全局变量
declare 
function
 
声明全局方法
declare 
class
 
声明全局类
declare 
enum
 
声明全局枚举类型
declare 
global
 
扩展全局变量
declare 
module
 
扩展模块
```

https://mp.weixin.qq.com/s?__biz=MzAxODE2MjM1MA==&mid=2651557265&idx=1&sn=cfab9a1c5fa6b8b8c365144a2a73907d&chksm=80255a50b752d346d96f7911c00962099b0daee885306bfa1fdc62b2821302a0e070db97c863&scene=21#wechat_redirect
