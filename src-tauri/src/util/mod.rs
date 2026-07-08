#[cfg(target_os = "macos")]
pub mod macos {
    use std::ffi::CString;
    use std::process::Command;

    /// Read a string value via sysctlbyname, e.g. "machdep.cpu.brand_string".
    pub fn sysctl_string(name: &str) -> Option<String> {
        let c_name = CString::new(name).ok()?;
        let mut len: libc::size_t = 0;
        // First call gets the required buffer size.
        let rc = unsafe {
            libc::sysctlbyname(
                c_name.as_ptr(),
                std::ptr::null_mut(),
                &mut len,
                std::ptr::null_mut(),
                0,
            )
        };
        if rc != 0 || len == 0 {
            return None;
        }
        let mut buf = vec![0u8; len];
        let rc = unsafe {
            libc::sysctlbyname(
                c_name.as_ptr(),
                buf.as_mut_ptr() as *mut libc::c_void,
                &mut len,
                std::ptr::null_mut(),
                0,
            )
        };
        if rc != 0 {
            return None;
        }
        buf.truncate(len);
        // Trim the trailing NUL.
        if buf.last() == Some(&0) {
            buf.pop();
        }
        String::from_utf8(buf).ok()
    }

    /// Read an integer value via sysctlbyname, e.g. "hw.perflevel0.physicalcpu".
    pub fn sysctl_u64(name: &str) -> Option<u64> {
        let c_name = CString::new(name).ok()?;
        let mut value: u64 = 0;
        let mut len = std::mem::size_of::<u64>() as libc::size_t;
        let rc = unsafe {
            libc::sysctlbyname(
                c_name.as_ptr(),
                &mut value as *mut u64 as *mut libc::c_void,
                &mut len,
                std::ptr::null_mut(),
                0,
            )
        };
        if rc != 0 {
            return None;
        }
        // sysctl may return a 4-byte int; it is written little-endian into `value`.
        Some(value)
    }

    /// Run a local system binary and capture stdout. Returns None on any failure
    /// or non-zero exit so callers degrade to `Field::Unavailable`.
    pub fn run_cmd(cmd: &str, args: &[&str]) -> Option<String> {
        let output = Command::new(cmd).args(args).output().ok()?;
        if !output.status.success() {
            return None;
        }
        String::from_utf8(output.stdout).ok()
    }
}

#[cfg(windows)]
pub mod windows {
    use serde::de::DeserializeOwned;
    use wmi::{COMLibrary, WMIConnection};

    /// Run a WQL query against root\cimv2 (or a custom namespace) and
    /// deserialize the rows. Any COM/WMI failure returns an empty Vec so
    /// callers degrade to `Field::Unavailable`.
    pub fn wmi_query<T: DeserializeOwned>(namespace: Option<&str>, query: &str) -> Vec<T> {
        let run = || -> Result<Vec<T>, wmi::WMIError> {
            let com = COMLibrary::new()?;
            let conn = match namespace {
                Some(ns) => WMIConnection::with_namespace_path(ns, com)?,
                None => WMIConnection::new(com)?,
            };
            conn.raw_query(query)
        };
        run().unwrap_or_default()
    }
}
