# Dependency Version

NodeJS merekomendasikan menggunakan semantic version dalam menentukan format version pada package yang kita buat
https://semver.org/

Jika kita perhatikan, kebanyakan package di https://www.npmjs.com/ menggunakan semantic version

1.1.1 -> MAJOR.MINOR.PATCH

- MAJOR version when you make incompatible API changes

- MINOR version when you add functionality in a backward compatible manner

- PATCH version when you make backward compatible bug fixes

## Menentukan Versi Dependency (1)

x -> Download versi terbaru dan update ke versi terbaru walaupun MAJOR berubah

1.x -> Download versi 1 terbaru, update ke versi terbaru, tapi MAJOR tetap di 1

1.1.x -> Download versi 1.1 terbaru, update ke versi terbaru, tapi MAJOR dan MINOR tetap di 1.1

1.1.1 -> Selalu download versi 1.1.1, tidak akan update walaupun ada versi baru

## Menentukan Versi Dependency (2)

~1.1.1 => Download versi 1.1.1, jika ada update, lakukan update, namun hanya update jika PATCH berubah

^1.1.1 -> Download versi 1.1.1, jika ada update, lakukan update, namun hanya update jika MINOR dan PATCH berubah

https://semver.npmjs.com/
