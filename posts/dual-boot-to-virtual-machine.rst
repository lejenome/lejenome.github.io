============================================
Physical boot to virtual EFI Windows machine
============================================

.. Author:: Moez Bouhlel <bmoez.j@gmail.com>
.. Id:: dualboolt-guest-window-machine
.. Tags:: linux, qemu, kvm, windows
.. Published:: 2016/09/15
.. Publish:: True

Even Linux is my main system, I frequently need to use Windows for school
homework when Mono does not support desired features. Running Windows inside a
virtual machine is always enough expect few cases. The best solution was to
setup a single windows system accessible from booth the virtual machine and
from the physical dual boot.

For the virtual machine, we will use *Qemu/KVM* with *Virtio* devices and a disk
partition for Windows.

First, you need to install Windows on your PC to get the boot entry with right
configurations (I couldn't find a work around BCD boot entry issue other than
this one). Then reboot to your Linux system to reinstall Windows on the same
partition but using the virtual machine this time.

Before we start, check that ``loop`` and ``linear`` modules are loaded:

.. code:: shell

    sudo modprobe loop
    sudo modprobe linear

Because the virtual machine need whole disk with booth the Windows partition
and the EFI partition, We need to create a virtual RAID. Let's create a small
file to hold the EFI partition:

.. code:: shell

    dd if=/dev/zero of=efi count=200000

Now you have ``efi`` file of 100 MB (200000 * 512 Bytes). Next, we create a
loopback device from the file:

.. code:: shell

    sudo losetup -f efi

It will assign the first available loopback device to the file. We will assume
that the assigned device is ``/dev/loop0``. To check the assigned device:

.. code:: shell

    losetup -a

Next, we will merge the loopback device and the real Windows partition into a
single linear RAID disk image (We will assume that the windows partition is
``/dev/sda2``):

.. code:: shell

    sudo mdadm --build --verbose /dev/md0 --chunk=16 --level=linear --raid-devices=2 /dev/loop0 /dev/sda2

Time to create the partitions table of the new RAID disk with reusing the same
physical Windows partition. For this step, we will use _parted_ utility. You
can use other tools on your own. We need to get the size of real Windows
partition on sectors.

.. code:: shell

    sudo parted /dev/sda unit s print

Partition your virtual RAID disk:

.. code:: shell

    sudo parted /dev/md0
    (parted) mktable gpt
    (parted) mkpart primary ntfs -WINDOW_PARITION_SIZE -1
    (parted) mkpart primary fat32 0 -WINDOW_PARITION_SIZE
    (parted) quit

Your final layout will have 2 partitions; Windows partition ``/dev/md0p1`` and
EFI partition ``/dev/md0p2``. You may get few warning messages when
creating partitions, ignore them. The new partitions need to be formatted.

.. code:: shell

    sudo mkfs.ntfs -f -L Windows -C /dev/md0p1
    sudo mkfs.msdos -F 32 -n EFI /dev/md0p2

Now, you are ready to launch the virtual machine and reinstall Windows. Change
``/dev/md0`` owner to the same user _Qemu_ is running as and install _ovmf_ EFI
bios for _Qemu_, in my case, it will be available at
``/usr/share/ovmf/ovmf_x64.bin``.

.. code:: shell

    qemu-system-x86_64 \
        -enable-kvm \
        -bios /usr/share/ovmf/ovmf_x64.bin \
        -drive file=/dev/md0,media=disk,format=raw \
        -netdev user,id=windowsnic,hostname=windowshost \
        -device virtio-net,netdev=windowsnic \
        -cpu host \
        -m 2G \
        -vga qxl \
        -usbdevice tablet

Adapt _Qemu_ script to your use case. You may need to download and install
`Virtio drivers`_ on your guest machine. After each reboot, you need to create
the loopback device, merge the two partitions into the RAID disk and change the
owner of the device.

Credit to `Arch Linux Wiki`_. Enjoy!

.. _Virtio drivers: https://fedoraproject.org/wiki/Windows_Virtio_Drivers
.. _Arch Linux Wiki: https://wiki.archlinux.org/index.php/QEMU#Simulate_virtual_disk_with_MBR_using_linear_RAID
