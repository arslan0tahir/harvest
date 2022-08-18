// ES

// CommonJS
const checkDiskSpace = require('check-disk-space').default

// On Windows
hello=async function(){
    await checkDiskSpace('C:/').then((diskSpace) => {
        console.log(diskSpace)
        // {
        //     diskPath: 'C:',
        //     free: 12345678,
        //     size: 98756432
        // }
        // Note: `free` and `size` are in bytes
    })

    console.log("promise reolced")
}

hello();

// console.log("test")

